import { useState, useEffect, useCallback } from "react";
import { Loader2, Eye, EyeOff, Save, AlertCircle, Check } from "lucide-react";
import SlidePanel from "../common/SlidePanel";
import { createServiceClient } from "../../services/apiClient";
import { getBucketsForObject } from "../../services/bucketApi";
import RecordFilesSection from "./RecordFilesSection";
import toast from "react-hot-toast";

// ── Relation option cache (lives for the page session) ──────────────
const relationCache = {};

/**
 * Fetch dropdown options for a relation field.
 *
 * For most data objects, hits the auto-generated _fetchList{objectLower} route
 * on the owning service. For system data objects (user/userGroup/tenant) that
 * have no _fetchList route, the meta carries a `listPathOverride` pointing at
 * the dedicated admin API (/v1/users, /v1/usergroups, /v1/tenants).
 */
async function fetchRelationOptions(
  serviceName,
  targetObject,
  labelField,
  listPathOverride,
) {
  const cacheKey = `${serviceName}:${targetObject}`;
  if (relationCache[cacheKey]) return relationCache[cacheKey];
  try {
    const client = createServiceClient(serviceName);
    let list;
    if (listPathOverride) {
      const res = await client.get(listPathOverride.listPath, {
        params: { pageRowCount: 200 },
      });
      list =
        res.data?.[listPathOverride.responseKey] ||
        res.data?.data ||
        res.data?.items ||
        [];
    } else {
      const objectLower = targetObject.toLowerCase();
      const res = await client.get(`/v1/_fetchlist${objectLower}`, {
        params: { pageRowCount: 200 },
      });
      list =
        res.data?.[targetObject + "s"] ||
        res.data?.[targetObject + "es"] ||
        res.data?.[targetObject + "ies"] ||
        res.data?.[targetObject] ||
        res.data?.data ||
        res.data?.items ||
        [];
    }
    const items = (Array.isArray(list) ? list : []).map((item) => ({
      value: item.id,
      label: item[labelField] || item.name || item.title || item.id,
    }));
    relationCache[cacheKey] = items;
    return items;
  } catch {
    return [];
  }
}

// ── Enum options baked at build time ────────────────────────────────
const OBJECT_META = {
  user: {
    serviceName: "auth",
    labelField: "fullname",
    enumConfigs: {},
    listPathOverride: { listPath: "/v1/users", responseKey: "users" },
  },
  userAvatarsFile: {
    serviceName: "auth",
    labelField: "fileName",
    enumConfigs: {},
  },
  inviteLink: {
    serviceName: "invitationcenter",
    labelField: "inviteCode",
    enumConfigs: {
      usageMode: [
        { label: "singleUse", value: "singleUse" },
        { label: "limitedUse", value: "limitedUse" },
      ],
      inviteState: [
        { label: "draft", value: "draft" },
        { label: "active", value: "active" },
        { label: "exhausted", value: "exhausted" },
        { label: "revoked", value: "revoked" },
        { label: "expired", value: "expired" },
        { label: "consumed", value: "consumed" },
      ],
    },
  },
  inviteAudit: {
    serviceName: "invitationcenter",
    labelField: "eventNote",
    enumConfigs: {
      eventType: [
        { label: "created", value: "created" },
        { label: "activated", value: "activated" },
        { label: "delivered", value: "delivered" },
        { label: "validated", value: "validated" },
        { label: "consumed", value: "consumed" },
        { label: "revoked", value: "revoked" },
        { label: "expired", value: "expired" },
      ],
    },
  },
  macroTarget: {
    serviceName: "nutritionlibrary",
    labelField: "id",
    enumConfigs: {},
  },
  foodItem: {
    serviceName: "nutritionlibrary",
    labelField: "foodName",
    enumConfigs: {
      creationSource: [
        { label: "manualEntry", value: "manualEntry" },
        { label: "aiAssistant", value: "aiAssistant" },
      ],
    },
  },
  presetMeal: {
    serviceName: "nutritionlibrary",
    labelField: "templateName",
    enumConfigs: {},
  },
  presetLine: {
    serviceName: "nutritionlibrary",
    labelField: "lineFoodName",
    enumConfigs: {},
  },
  mealLog: {
    serviceName: "mealtracker",
    labelField: "slotName",
    enumConfigs: {
      logSource: [
        { label: "foodLibrary", value: "foodLibrary" },
        { label: "presetTemplate", value: "presetTemplate" },
        { label: "manualEntry", value: "manualEntry" },
        { label: "aiAssistant", value: "aiAssistant" },
      ],
    },
  },
  mealLine: {
    serviceName: "mealtracker",
    labelField: "itemName",
    enumConfigs: {
      lineSource: [
        { label: "foodLibrary", value: "foodLibrary" },
        { label: "presetTemplate", value: "presetTemplate" },
        { label: "manualEntry", value: "manualEntry" },
        { label: "aiAssistant", value: "aiAssistant" },
        { label: "temporaryAi", value: "temporaryAi" },
      ],
    },
  },
  nutritionDay: {
    serviceName: "mealtracker",
    labelField: "exceededMetrics",
    enumConfigs: {},
  },
  aiSession: {
    serviceName: "nutritionai",
    labelField: "detectedLanguage",
    enumConfigs: {
      sessionType: [
        { label: "mealParsing", value: "mealParsing" },
        { label: "nutritionGuidance", value: "nutritionGuidance" },
      ],
      sessionState: [
        { label: "pending", value: "pending" },
        { label: "needsConfirmation", value: "needsConfirmation" },
        { label: "completed", value: "completed" },
        { label: "failed", value: "failed" },
      ],
    },
  },
  aiCandidateMeal: {
    serviceName: "nutritionai",
    labelField: "proposedMealTime",
    enumConfigs: {
      candidateSource: [{ label: "aiAssistant", value: "aiAssistant" }],
    },
  },
  aiCandidateLine: {
    serviceName: "nutritionai",
    labelField: "detectedFoodName",
    enumConfigs: {},
  },
  aiGuidanceNote: {
    serviceName: "nutritionai",
    labelField: "questionType",
    enumConfigs: {},
  },
  sys_agentOverride: {
    serviceName: "agenthub",
    labelField: "agentName",
    enumConfigs: {},
  },
  sys_agentExecution: {
    serviceName: "agenthub",
    labelField: "agentName",
    enumConfigs: {
      agentType: [
        { label: "design", value: "design" },
        { label: "dynamic", value: "dynamic" },
      ],
      source: [
        { label: "rest", value: "rest" },
        { label: "sse", value: "sse" },
        { label: "kafka", value: "kafka" },
        { label: "agent", value: "agent" },
      ],
      status: [
        { label: "success", value: "success" },
        { label: "error", value: "error" },
        { label: "timeout", value: "timeout" },
      ],
    },
  },
  sys_toolCatalog: {
    serviceName: "agenthub",
    labelField: "toolName",
    enumConfigs: {},
  },
};

// ── Field renderers ─────────────────────────────────────────────────

function FieldLabel({ name, required }) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {name}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function StringField({ field, value, onChange, disabled }) {
  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm disabled:opacity-60"
      placeholder={field.description || field.name}
    />
  );
}

function TextField({ field, value, onChange, disabled }) {
  return (
    <textarea
      rows={3}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="form-textarea w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm disabled:opacity-60"
      placeholder={field.description || field.name}
    />
  );
}

function NumberField({ field, value, onChange, disabled }) {
  return (
    <input
      type="number"
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? "" : Number(e.target.value))
      }
      disabled={disabled}
      step={field.type === "Integer" ? "1" : "any"}
      className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm disabled:opacity-60"
      placeholder={field.description || field.name}
    />
  );
}

function BooleanField({ field, value, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!value}
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${value ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-600"}
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${value ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

function DateField({ field, value, onChange, disabled }) {
  const isDateTime = field.type === "DateTime" || field.type === "Date";
  return (
    <input
      type={isDateTime ? "datetime-local" : "date"}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm disabled:opacity-60"
    />
  );
}

function SecretField({ field, value, onChange, disabled }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm pr-10 disabled:opacity-60"
        placeholder={field.description || field.name}
        autoComplete="off"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function EnumField({ field, value, onChange, disabled, options }) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="form-select w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm disabled:opacity-60"
    >
      <option value="">— Select —</option>
      {(options || []).map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function RelationField({ field, value, onChange, disabled }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!field.relation) return;
    const meta = OBJECT_META[field.relation.targetObject] || {};
    setLoading(true);
    fetchRelationOptions(
      meta.serviceName || field.serviceName,
      field.relation.targetObject,
      meta.labelField || "name",
      meta.listPathOverride,
    )
      .then(setOptions)
      .finally(() => setLoading(false));
  }, [field.relation?.targetObject]);

  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        className="form-select w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm disabled:opacity-60"
      >
        <option value="">— {loading ? "Loading..." : "Select"} —</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {loading && (
        <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
      )}
    </div>
  );
}

function JsonField({ field, value, onChange, disabled }) {
  const strVal =
    typeof value === "string" ? value : JSON.stringify(value ?? "", null, 2);
  return (
    <textarea
      rows={4}
      value={strVal}
      onChange={(e) => {
        try {
          onChange(JSON.parse(e.target.value));
        } catch {
          onChange(e.target.value);
        }
      }}
      disabled={disabled}
      className="form-textarea w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm font-mono disabled:opacity-60"
      placeholder="JSON"
    />
  );
}

// ── Main component ──────────────────────────────────────────────────

/**
 * RecordFormPanel
 *
 * Props:
 *   isOpen          — boolean
 *   onClose         — callback
 *   mode            — 'create' | 'edit'
 *   objectConfig    — { name, modelName, properties: [...] }
 *   apiConfig       — { routePath, method, parameters: [...] }  (the default create/update API)
 *   record          — object | null  (existing record for edit mode)
 *   serviceName     — string
 *   onSuccess       — callback after successful save
 */
export default function RecordFormPanel({
  isOpen,
  onClose,
  mode = "create",
  objectConfig,
  apiConfig,
  record,
  serviceName,
  onSuccess,
}) {
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Determine which fields to show: body parameters from the API
  const fields = (apiConfig?.parameters || []).filter(
    (p) => p.httpLocation === "body",
  );

  // Merge property metadata with API parameter info
  const enrichedFields = fields.map((param) => {
    const prop = (objectConfig?.properties || []).find(
      (p) => p.name === param.name,
    );
    const objMeta = OBJECT_META[objectConfig?.name] || {};
    const enumOpts = objMeta.enumConfigs?.[param.name] || [];
    return {
      ...param,
      type: prop?.type || param.type || "String",
      relation: prop?.relation || null,
      isSecret: prop?.isSecret || false,
      allowUpdate: prop?.allowUpdate !== false,
      enumOptions: enumOpts,
      serviceName,
    };
  });

  // Initialize form when panel opens or record changes
  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && record) {
      const initial = {};
      for (const f of enrichedFields) {
        initial[f.name] = record[f.name] !== undefined ? record[f.name] : "";
      }
      setFormData(initial);
    } else {
      // Create mode — pre-fill with default values
      const initial = {};
      for (const f of enrichedFields) {
        initial[f.name] = f.default !== undefined ? f.default : "";
      }
      setFormData(initial);
    }
    setErrors({});
  }, [isOpen, mode, record?.id]);

  const setValue = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (prev[name]) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return prev;
    });
  }, []);

  // Client-side validation
  const validate = () => {
    const errs = {};
    for (const f of enrichedFields) {
      if (
        f.required &&
        (formData[f.name] === "" ||
          formData[f.name] === undefined ||
          formData[f.name] === null)
      ) {
        errs[f.name] = "Required";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const client = createServiceClient(serviceName);
      const routePath = apiConfig?.routePath || "/";

      // Build payload — only send non-empty body params
      const payload = {};
      for (const f of enrichedFields) {
        const val = formData[f.name];
        if (val !== "" && val !== undefined && val !== null) {
          payload[f.name] = val;
        } else if (f.required) {
          payload[f.name] = val;
        }
      }

      if (mode === "create") {
        await client.post(routePath, payload);
        toast.success(`${objectConfig?.modelName || "Record"} created`);
      } else {
        // For update, inject the record id into the route if needed
        let updatePath = routePath;
        if (record?.id) {
          // Replace :xxxId param in path, or append /id
          const idParam = `:${objectConfig?.name}Id`;
          if (updatePath.includes(idParam)) {
            updatePath = updatePath.replace(idParam, record.id);
          } else if (!updatePath.includes(record.id)) {
            updatePath = updatePath.replace(/\/?$/, `/${record.id}`);
          }
        }
        await client.patch(updatePath, payload);
        toast.success(`${objectConfig?.modelName || "Record"} updated`);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Save failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const value = formData[field.name];
    const onChange = (v) => setValue(field.name, v);
    const disabled = mode === "edit" && !field.allowUpdate;

    // Relation dropdown
    if (field.relation) {
      return (
        <RelationField
          field={field}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    }
    // Enum dropdown
    if (field.type === "Enum" && field.enumOptions?.length > 0) {
      return (
        <EnumField
          field={field}
          value={value}
          onChange={onChange}
          disabled={disabled}
          options={field.enumOptions}
        />
      );
    }
    // Secret
    if (field.isSecret) {
      return (
        <SecretField
          field={field}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    }
    // By type
    switch (field.type) {
      case "Text":
        return (
          <TextField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case "Integer":
      case "Float":
      case "Double":
      case "Decimal":
        return (
          <NumberField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case "Boolean":
        return (
          <BooleanField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case "Date":
      case "DateTime":
        return (
          <DateField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case "Object":
      case "JSON":
        return (
          <JsonField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      default:
        return (
          <StringField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
    }
  };

  const title =
    mode === "create"
      ? `Create ${objectConfig?.modelName || "Record"}`
      : `Edit ${objectConfig?.modelName || "Record"}`;

  // Buckets that name this data object as their owner — surfaced as a
  // Files section only in edit mode (the owner FK needs the record id).
  const ownedBuckets = getBucketsForObject(objectConfig?.name);
  const showFilesSection =
    mode === "edit" && record?.id && ownedBuckets.length > 0;

  return (
    <SlidePanel isOpen={isOpen} onClose={onClose} title={title} size="lg">
      {enrichedFields.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p className="text-sm">No fields available for this operation.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {enrichedFields.map((field) => (
            <div key={field.name}>
              <FieldLabel name={field.name} required={field.required} />
              {renderField(field)}
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-500">
                  {errors[field.name]}
                </p>
              )}
              {field.description && (
                <p className="mt-1 text-xs text-gray-400">
                  {field.description}
                </p>
              )}
            </div>
          ))}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-sm"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {mode === "create" ? "Create" : "Save Changes"}
            </button>
          </div>
        </form>
      )}

      {/* Files: attached buckets — only in edit mode (needs the record id). */}
      {showFilesSection && (
        <div className="mt-6 space-y-4">
          {ownedBuckets.map((bucket) => (
            <RecordFilesSection
              key={`${bucket.serviceName}:${bucket.bucketName}`}
              bucket={bucket}
              ownerId={record.id}
            />
          ))}
        </div>
      )}
    </SlidePanel>
  );
}
