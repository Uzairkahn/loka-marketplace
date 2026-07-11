/**
 * Parses page/limit query params with sane bounds and returns both the
 * Mongoose skip/limit values and a ready-to-send pagination meta object,
 * so every list endpoint (listings now, others later) shapes this the
 * same way instead of each controller reinventing it.
 */
const paginate = (query, defaultLimit = 12, maxLimit = 50) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), maxLimit);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildPaginationMeta = (page, limit, totalCount) => ({
  page,
  limit,
  totalCount,
  totalPages: Math.max(Math.ceil(totalCount / limit), 1),
  hasNextPage: page * limit < totalCount,
});

module.exports = { paginate, buildPaginationMeta };
