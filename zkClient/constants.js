// some of the constants not exported by the library(eg: ZOO_EPHEMERAL_SEQUENTIAL), so I am "exporting" them here or using
const NODE_TYPE_MAPPING = {
  ZOO_PERSISTENT: 0,
  ZOO_EPHEMERAL: 1,
  ZOO_SEQUENCE: 2,
  ZOO_PERSISTENT_SEQUENTIAL: 2,
  ZOO_EPHEMERAL_SEQUENTIAL: 3
}

module.exports = {
  NODE_TYPE_MAPPING,
};
