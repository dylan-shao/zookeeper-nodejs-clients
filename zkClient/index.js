
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

    // 选举master用的path
    this.masterElectionPath = '/bm/master';
    this.taskAssignPath = '/bm/task';
  }

  init() {
    this.client.init(config);

    const connectCallBack  = async () => {

      // 选举master的path，依赖ZOO_EPHEMERAL_SEQUENTIAL
      const _masterPath = await this.createPath(`${this.masterElectionPath}/`, 0, NODE_TYPE_MAPPING.ZOO_EPHEMERAL_SEQUENTIAL);
      console.log(_masterPath, 234234)
      this.myPathForLeaderSelection = this._trimMypath(_masterPath);

      // 存task的path，貌似可以和上面的path结合使用一个
      // 这里用ZOO_EPHEMERAL_SEQUENTIAL的原因是，加一个随机数防止名称一样，否则停一个client，5s内再启动会报node exists（5s应该是zk的存活检测时间）
      this.myPathForTaskId = await this.createPath(`${this.taskAssignPath}/${process.env.NAME}`, 0, NODE_TYPE_MAPPING.ZOO_EPHEMERAL_SEQUENTIAL);

      await this.watchBm();
    };

    this.client.on('connect', connectCallBack);

    const closeCallBack = () => {
      console.log('close')
    };

    this.client.on('close', closeCallBack)
  }

  _isMaster(children) {
    const childrenSort = children.sort();
    console.log(this.myPathForLeaderSelection, childrenSort[0], 1111)
    return childrenSort[0] === this.myPathForLeaderSelection;
  }

  static async reCalculateLoad(numChildren) {
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
      const [children, stat] = await this.client.w_get_children2(this.masterElectionPath, async() => {
        await this.watchBm();
      });
      
      if (this._isMaster(children)) {
        console.log(`I am the master: ${this.myPathForLeaderSelection}`)
        if (stat && stat.numChildren > this.BARRIER_SIZE) {
          // 增加timestamp，防止并发
          ZkClient.reCalculateLoad();
        }
      }
    } catch(e) {
      console.log(`watchBm error ${e}`);
    }
   
  }

  _trimMypath(path) {
    return path.split(`${this.masterElectionPath}/`)[1];
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