const { getDocument } = require("../utils/elasticsearch.js");
const { notificationService } = require("../services");
const _ = require("lodash");

module.exports = {
  topic: "fitcheck-mealtracker-service-zeromealsdaydetected",
  handle: async (event) => {
    try {
      const mappedData = {
        types: ["email"],
        isStored: true,
        template: "dailyMealReminderTemplate",
        metadata: {
          ...event,
          actionDeepLink: "",
          actionText: "",
        },
      };

      // dataViewIdPathInPayload is documented as defaulting to "id"
      // but isn't materialised by the pattern, so guard here too —
      // an unset value would otherwise render as `event.;` and the
      // generated handler fails to load with a SyntaxError.
      let dataViewId = event.id;
      // Db-event payload shape varies by event type:
      //   - `*-created` / `*-deleted`: the record IS the payload (`event.id` works)
      //   - `*-updated`: payload is `{ <objectName>: newData, old_<objectName>: oldData,
      //                  oldDataValues, newDataValues }` — `event.id` is undefined and
      //                  the id lives at `event.<objectName>.id`.
      // When the explicit/default path didn't resolve, scan the payload for a nested
      // record-shaped object with an `id` and use that. Wrapper keys are skipped.
      if (dataViewId == null && event && typeof event === "object") {
        for (const _k of Object.keys(event)) {
          if (
            _k === "oldDataValues" ||
            _k === "newDataValues" ||
            _k === "sessionData" ||
            _k.startsWith("old_")
          )
            continue;
          const _cand = event[_k];
          if (_cand && typeof _cand === "object" && _cand.id) {
            dataViewId = _cand.id;
            break;
          }
        }
      }
      if (dataViewId == null) {
        console.warn(
          `fitcheck-mealtracker-service-zeromealsdaydetected: no id resolvable in payload — skipping notification`,
          { keys: Object.keys(event || {}) },
        );
        return;
      }
      const dataSource = await getDocument(
        "lrmwufitcheck_DailyMealReminderNotificationView",
        dataViewId,
      );
      if (!dataSource || !dataSource._source) {
        // ES doc not found — could be a brand-new record whose ES index has yet to
        // settle, or a stale event after the source was deleted. Log and skip;
        // do NOT crash the consumer group (uncaught throws upstream of kafka-runner
        // halt the partition).
        console.warn(
          `fitcheck-mealtracker-service-zeromealsdaydetected: ES record not found for id=${dataViewId} in index "lrmwufitcheck_DailyMealReminderNotificationView" — skipping notification`,
        );
        return;
      }

      this.dataSource = dataSource._source;
      mappedData.metadata = {
        ...mappedData.metadata,
        dataSource: dataSource._source,
      };

      const targetuser = _.get(mappedData.metadata.dataSource, "user.id");
      mappedData.to = targetuser;
      await notificationService.sendNotification(mappedData);
    } catch (error) {
      //**errorLog
      console.error(
        "fitcheck-mealtracker-service-zeromealsdaydetected ",
        error,
      );
    }
  },
};
