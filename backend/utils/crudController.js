const asyncHandler = require("./asyncHandler");
const { sendSuccess, sendError } = require("./apiResponse");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SYSTEM_PATHS = ["_id", "__v", "createdAt", "updatedAt"];

/**
 * Builds list / getOne / create / update / remove handlers for any Mongoose model.
 *
 * options:
 *   label         "Volunteer"   used in response messages
 *   searchFields  ["fullName"]  fields matched by ?search=
 *   filterFields  ["status"]    fields filterable by ?status=Active
 *   populate      "donor"       relations to expand in responses
 *   sort          "-createdAt"  default sort
 *   deleteGuard   async (id) => string | null   return a message to block deletion
 */
function createCrudController(Model, opts = {}) {
  const {
    label = Model.modelName,
    searchFields = [],
    filterFields = [],
    populate = "",
    sort = "-createdAt",
    deleteGuard = null,
  } = opts;

  // Only allow fields that exist in the schema (blocks mass-assignment and $operators).
  // Empty strings from forms become null so optional enum/date/number fields stay valid.
  const allowed = Object.keys(Model.schema.paths).filter((p) => !SYSTEM_PATHS.includes(p));
  const clean = (body = {}) => {
    const out = {};
    for (const key of allowed) {
      if (!(key in body)) continue;
      const required = Model.schema.paths[key].isRequired;
      out[key] = body[key] === "" && !required ? null : body[key];
    }
    return out;
  };

  const notFound = (res) => sendError(res, `${label} not found`, 404);

  const list = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

    const filter = {};
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    if (search && searchFields.length) {
      const rx = new RegExp(escapeRegex(search), "i");
      filter.$or = searchFields.map((f) => ({ [f]: rx }));
    }
    for (const f of filterFields) {
      if (typeof req.query[f] === "string" && req.query[f]) filter[f] = req.query[f]; // strings only
    }

    const [items, total] = await Promise.all([
      Model.find(filter).populate(populate).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Model.countDocuments(filter),
    ]);

    sendSuccess(
      res,
      { items, pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) } },
      `${label} list`
    );
  });

  const getOne = asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id).populate(populate).lean();
    if (!doc) return notFound(res);
    sendSuccess(res, doc, `${label} details`);
  });

  const create = asyncHandler(async (req, res) => {
    const doc = await Model.create(clean(req.body));
    const saved = await Model.findById(doc._id).populate(populate).lean();
    sendSuccess(res, saved, `${label} created`, 201);
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, clean(req.body), {
      new: true,
      runValidators: true,
    })
      .populate(populate)
      .lean();
    if (!doc) return notFound(res);
    sendSuccess(res, doc, `${label} updated`);
  });

  const remove = asyncHandler(async (req, res) => {
    if (deleteGuard) {
      const blocked = await deleteGuard(req.params.id);
      if (blocked) return sendError(res, blocked, 409);
    }
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return notFound(res);
    sendSuccess(res, null, `${label} deleted`);
  });

  return { list, getOne, create, update, remove };
}

module.exports = createCrudController;
