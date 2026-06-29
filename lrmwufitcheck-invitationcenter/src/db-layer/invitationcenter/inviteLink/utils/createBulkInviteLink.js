const { HttpServerError, HttpError, BadRequestError } = require("common");
const { InviteLink } = require("models");
const { newUUID } = require("common");
const { Op } = require("sequelize");
const {
  indexDataToElastic,
  raiseDbEventCreate,
  createEntityCache,
  invalidateQueryCache,
} = require("./helper");

const validateData = (data) => {
  if (!data.id) {
    data.id = newUUID();
  }
};

async function checkBulkUniqueIndices(recordsToCreate) {
  const indexUpdates = [];
  const indexSkips = [];
  const processedIds = new Set();
  let remaining = [...recordsToCreate];

  // Check index: inviteCodeUniqueIndex (throwError)
  if (remaining.length > 0) {
    const getKey_inviteCodeUniqueIndex = (r) => String(r.inviteCode ?? null);

    const orConditions_inviteCodeUniqueIndex = remaining.map((data) => ({
      inviteCode: data.inviteCode ?? null,
    }));

    const conflicts_inviteCodeUniqueIndex = await InviteLink.findAll({
      where: { [Op.or]: orConditions_inviteCodeUniqueIndex },
    });

    if (conflicts_inviteCodeUniqueIndex.length > 0) {
      const conflictMap_inviteCodeUniqueIndex = new Map();
      conflicts_inviteCodeUniqueIndex.forEach((dbDoc) => {
        conflictMap_inviteCodeUniqueIndex.set(
          getKey_inviteCodeUniqueIndex(dbDoc),
          dbDoc,
        );
      });

      // throwError: abort entire bulk operation if any record conflicts
      const matched_inviteCodeUniqueIndex = remaining.filter((d) =>
        conflictMap_inviteCodeUniqueIndex.has(getKey_inviteCodeUniqueIndex(d)),
      );
      if (matched_inviteCodeUniqueIndex.length > 0) {
        throw new BadRequestError(
          "errMsg_DuplicateUniqueIndexError:inviteCodeUniqueIndex",
        );
      }
    }
  }

  return { recordsToCreate: remaining, indexUpdates, indexSkips };
}

const createBulkInviteLink = async (dataList, context = null) => {
  try {
    if (!Array.isArray(dataList) || dataList.length === 0) {
      throw new BadRequestError("Data list must be a non-empty array.");
    }

    // Step 1: Pre-process all records in parallel (codename calculation, validation)
    const processedDataList = await Promise.all(
      dataList.map(async (data) => {
        // Create a copy to avoid mutating the original
        const processedData = { ...data };

        // Validate and ensure ID exists
        validateData(processedData);

        return processedData;
      }),
    );

    // Step 2: Batch check for existing records by ID
    const idsToCheck = processedDataList
      .filter((data) => data.id)
      .map((data) => data.id);

    const existingRecordsMap = new Map();
    if (idsToCheck.length > 0) {
      const existingRecords = await InviteLink.findAll({
        where: {
          id: {
            [Op.in]: idsToCheck,
          },
        },
      });

      existingRecords.forEach((record) => {
        existingRecordsMap.set(record.id, record);
      });
    }

    // Step 3: Separate records into updates and creates
    const recordsToUpdate = [];
    const recordsToCreate = [];
    const updateDataMap = new Map(); // Map to store update data for each ID

    processedDataList.forEach((data) => {
      const existingRecord = data.id ? existingRecordsMap.get(data.id) : null;

      if (existingRecord) {
        // Prepare update data
        const updateData = { ...data };
        delete updateData.id; // Remove ID from update data

        recordsToUpdate.push(existingRecord);
        updateDataMap.set(existingRecord.id, updateData);
      } else {
        // New record to create
        recordsToCreate.push(data);
      }
    });

    // Step 3b: Batch check composite index constraints on records to be created

    const indexCheckResult = await checkBulkUniqueIndices(recordsToCreate);
    const finalRecordsToCreate = indexCheckResult.recordsToCreate;
    const skippedRecords = indexCheckResult.indexSkips;

    // Merge index-based updates with ID-based updates
    for (const { data, dbRecord } of indexCheckResult.indexUpdates) {
      const updateData = { ...data };
      delete updateData.id;

      recordsToUpdate.push(dbRecord);
      updateDataMap.set(dbRecord.id, updateData);
    }

    // Step 4: Bulk update existing records
    const updatedRecords = [];
    if (recordsToUpdate.length > 0) {
      // Use Promise.all for parallel updates to maintain individual record handling
      // while still being more efficient than sequential
      const updatePromises = recordsToUpdate.map(async (record) => {
        const updateData = updateDataMap.get(record.id);
        await record.update(updateData);
        return record;
      });

      const updated = await Promise.all(updatePromises);
      updatedRecords.push(...updated);
    }

    // Step 5: Bulk create new records (only those not handled by ID or index checks)
    const createdRecords = [];
    if (finalRecordsToCreate.length > 0) {
      const bulkCreated = await InviteLink.bulkCreate(finalRecordsToCreate, {
        returning: true,
        validate: true,
      });
      createdRecords.push(...bulkCreated);
    }

    // Step 6: Combine all results and prepare for post-processing
    // Includes: ID-based updates, index-based updates, new creates, and stopOperation skips
    const allRecords = [
      ...updatedRecords,
      ...createdRecords,
      ...skippedRecords,
    ];

    // Step 7: Post-process all records (Elasticsearch indexing and db events)
    // Index all records and raise events in parallel for better performance
    const resultList = await Promise.all(
      allRecords.map(async (record) => {
        const _data = record.getData();
        await createEntityCache(_data);
        await indexDataToElastic(_data, context);
        await invalidateQueryCache(_data);
        await raiseDbEventCreate(_data, context);
        return _data;
      }),
    );

    return resultList;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    //**errorLog
    throw new HttpServerError("errMsg_dbErrorWhenCreatingBulkInviteLink", err);
  }
};

module.exports = createBulkInviteLink;
