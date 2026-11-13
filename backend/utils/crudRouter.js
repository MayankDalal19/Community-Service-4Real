const express = require("express");

// Standard REST routes for a CRUD controller:
//   GET /  ·  POST /  ·  GET /:id  ·  PUT /:id  ·  DELETE /:id
module.exports = (c, options = {}) => {
  const router = express.Router();
  const writeMw = options.writeMiddleware ? [options.writeMiddleware] : [];
  const deleteMw = options.deleteMiddleware
    ? [options.deleteMiddleware]
    : writeMw;

  router
    .route("/")
    .get(c.list)
    .post(...writeMw, c.create);

  router
    .route("/:id")
    .get(c.getOne)
    .put(...writeMw, c.update)
    .delete(...deleteMw, c.remove);

  return router;
};
