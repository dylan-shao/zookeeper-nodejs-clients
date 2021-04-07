
const ZooKeeper = require('zookeeper');
const _  =require('lodash');
const { NODE_TYPE_MAPPING } = require('./constants');

const config = {
  connect: 'localhost:2181',
  timeout: 5000,
  debug_level: ZooKeeper.ZOO_LOG_LEVEL_WARN,
  host_order_deterministic: false,
};
// function createClient() {
//   return new ZooKeeper(config);
// }
class ZkClient {
  constructor() {
    this.client = new ZooKeeper(config);
    // 控制多少个实例加入zk后才启动计算
    this.BARRIER_SIZE = 3;
    this.masterPath = '/bm/master';
  }

  init() {
    this.client.init(config);

    const connectCallBack  = async () => {

      const data = 'hello world 11';
      const _masterPath = await this.createPath(`${this.masterPath}/`, data, NODE_TYPE_MAPPING.ZOO_EPHEMERAL_SEQUENTIAL);
      this.myPathForLeaderSelection = this.trimMypath(_masterPath);
console.log(_masterPath,222)
      this.myPathForTaskId = await this.createPath(`/bm/email-rows/${process.env.NAME}`, 0, NODE_TYPE_MAPPING.ZOO_EPHEMERAL_SEQUENTIAL);

      await this.watchBm();
    };

    this.client.on('connect', connectCallBack);

    const closeCallBack = () => {
      console.log('close')
    };

    this.client.on('close', closeCallBack)
  }

  async checkIfMaster() {

  }

  async reCalculateLoad(numChildren) {
    console.log("re-calculating~~~~");
    const timestamp = Date.parse(new Date());
    const allEmails = (new Array(20)).fill("test@mokahr.com");

    const chunkedEmails = _.chunk(allEmails, numChildren);

    for(let emailArray of chunkedEmails) {
      // 1. read id from zk, read from db, if process date is large than timestamp, abort
      // else update db

      // 2. update db
    }
  }

  async watchBm() {
    try {
      console.log(444)
      const [children, stat] = await this.client.w_get_children2(this.masterPath, async() => {
        await this.watchBm();
      });
      const childrenSort = children.sort();
      console.log(this.myPathForLeaderSelection, childrenSort[0], 1111)
      if (childrenSort[0] === this.myPathForLeaderSelection) {
        console.log(`I am the master: ${this.myPathForLeaderSelection}`)
        if (stat && stat.numChildren > this.BARRIER_SIZE) {
          // 增加timestamp，防止并发
          this.reCalculateLoad();
        }
      }
    } catch(e) {
      console.log(`watchBm error ${e}`);
    }
   
  }

  trimMypath(path) {
    return path.split(`${this.masterPath}/`)[1];
  }

  async createPath(path, data, nodeType) {
    try {
        const createdPath = await this.client.create(path, data, nodeType);
        console.log(`(created: ${createdPath})`);
        return createdPath;
    } catch (error) {
        console.log(error, `${path} already exists`);
    }

  }
};

const zkClient = new ZkClient();
zkClient.init();



module.exports = zkClient;