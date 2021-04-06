
const ZooKeeper = require('zookeeper');


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
  }

  init() {
    this.client.init(config);

    const connectCallBack  = async () => {

      const path = '/bm/zk';
      const data = 'hello world 11';
      await this.createPath(path, data);
    };

    this.client.on('connect', connectCallBack);

    const closeCallBack = () => {
      console.log('close')
    };

    this.client.on('close', closeCallBack)
  }

  async checkIfMaster() {

  }

  async watchBm() {
    const [children, stat] = await this.client.w_get_children2( '/bm', async(a,b,c ) => {
      console.log(a,b,c, 123)
      await this.watchBm();
    });
    const childrenSort = children.sort();
    if (childrenSort[0] === this.myPath) {
      console.log(`I am the master: ${this.myPath}`)
    }
    console.log(children,childrenSort[0],this.myPath,'children');
    console.log(stat, 'stat');
  }

  trimMypath(path) {
    return path.split('/bm/')[1];
  }

  async createPath(path, data) {
    try {
        const createdPath = await this.client.create(path, data, 3);
        this.myPath = this.trimMypath(createdPath);
        console.log(`(created: ${createdPath}), my path: ${this.myPath}`);
    } catch (error) {
        console.log(error, `${path} already exists`);
    }

    await this.watchBm();
  }
};

const zkClient = new ZkClient();
zkClient.init();



module.exports = zkClient;