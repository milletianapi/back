const mongodb = require('mongodb');
const encode = require("../query/combined_result.json");
const axios = require('axios');

const channelOptions = {
    lute: Array.from({ length: 42 }, (_, i) => i + 1),
    harp: Array.from({ length: 24 }, (_, i) => i + 1),
    mandolin: Array.from({ length: 15 }, (_, i) => i + 1),
    wolf: Array.from({ length: 15 }, (_, i) => i + 1),
};

const encodeTrades = {
    "bangor": "상인 라누", //반호르
    "belvast": "상인 피루", //벨파스트
    "calidaExplorationCamp": "모락", //칼리다 탐사 캠프
    "portCobhr": "상인 아루", //카브항구
    "cor": "리나", // 코르 마을
    "dunbarton": "상인 누누", //던바튼
    "emainMacha": "상인 메루", //이멘마하
    "filia": "켄", // 필리아
    "caruForest": "귀넥", // 카루숲
    "oasis": "얼리", //오아시스
    "pela": "데위", //페라 화산
    "qillaBaseCamp": "테일로", //켈라 베이스 캠프
    "beachOfScathach": "상인 세누", //스카하정찰캠프
    "taillteann": "상인 베루", //탈틴
    "tara": "상인 에루", //타라
    "tirChonaill": "상인 네루", //티르코네일
    "vales": "카디", //발레스
}

const encodeServer = {
    "lute": "류트",
    "mandolin": "만돌린",
    "harp": "하프",
    "wolf": "울프"
}

const serverOptions = ['lute','harp','mandolin','wolf']

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const KEY = 'live_338dbbe7d121fa299df2de7c28d5d974ada91ff22d2577b0886df5685d3d7ff7efe8d04e6d233bd35cf2fabdeb93fb0d';

const totalGet = async () => {
    const now = Date.now();
    const startOfDay = new Date(now).setHours(0, 0, 0, 0);
    const CYCLE_DURATION = 36 * 60 * 1000;
    const cycle = Math.floor((now - startOfDay) / CYCLE_DURATION) + 1;
    const date = new Date(now);
    const ymd = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    let count = 0;
    try{
        const test = await axios.get(`https://open.api.nexon.com/mabinogi/v1/npcshop/list`,
            { headers: {'x-nxopen-api-key': KEY},
                params:{
                    'npc_name': encodeTrades[`bangor`],
                    'server_name': encodeServer[`lute`],
                    'channel': 1,
                } });
        if(test.status === 400){return `fail`;}
    } catch {
        return `fail`;
    }

     for (const server of serverOptions) {
        for (const index of channelOptions[server]) {
            for (const trade in encodeTrades) {
                const getData = async (retryCount = 0) => {
                    console.log(++count, "progressing");
                    console.log(server , index , trade)
                    try {
                        const channelnum = index;
                        const { data: resultData , status: status } = await axios.get(`https://open.api.nexon.com/mabinogi/v1/npcshop/list`,
                            { headers: {'x-nxopen-api-key': KEY},
                                params:{
                                    'npc_name': encodeTrades[trade],
                                    'server_name': encodeServer[server],
                                    'channel': channelnum,
                                } });
                        if(status === 400){
                            console.log('fail');
                            return;}
                        if (resultData.error && resultData.error.name === "OPENAPI00009") {
                            console.error('Data is not ready, skipping request.');
                            return;
                        }

                        if (!resultData.shop || !resultData.shop[2] || !resultData.shop[2].item || resultData.shop[2].item.length !== 22) {
                            if (retryCount < 3) {
                                console.log(`Retrying... Attempt ${retryCount + 1}`);
                                await getData(retryCount + 1);
                            } else {
                                console.error('Failed after 3 attempts.');
                            }
                            return;
                        }

                        pouchQuery(resultData, ymd, cycle, server, channelnum, trade);
                    } catch (error) {
                        if (retryCount < 3) {
                            console.log(`Retrying due to error... Attempt ${retryCount + 1}`);
                            await getData(retryCount + 1);
                        } else {
                            console.error('Failed after 3 attempts due to error:', error);
                        }
                    }
                }
                getData();
                await delay(10);
            }
        }
     }
}

const uri = 'mongodb+srv://yoop80075:whrudwns!048576@cluster0.r9zhf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const mongo = new mongodb.MongoClient(uri);
let client = mongo.db('mabi').collection('total');

const pouchQuery = async (response, ymd, cycle, server, channelnum, trade) => {
    const baseOffset = 86;
    const rowStep = 18;
    const colStep = 4;
    const keyLength = 2;

    const bulkOps = [];

    for (const item of response.shop[2].item) {
        const pouch = {
            date: ymd,
            cycle: cycle,
            server: server,
            channel: channelnum,
            trade: trade,
            item_name: item.item_display_name,
            color: { a: { r: 0, g: 0, b: 0 }, b: { r: 0, g: 0, b: 0 }, c: { r: 0, g: 0, b: 0 } },
    };
        for (let i = 0; i < 3; i++) {
            const colorTable = i === 0 ? 'a' : i === 1 ? 'b' : 'c';
            for (let j = 0; j < 3; j++) {
                const t2 = j === 0 ? 'r' : j === 1 ? 'g' : 'b';
                const offset1 = baseOffset + (i * rowStep) + (j * colStep);
                const key1 = item.image_url.substring(offset1, offset1 + keyLength);
                const key2 = item.image_url.substring(offset1 + keyLength, offset1 + keyLength * 2);
                const up = encode[colorTable][j + 1]['upper'][key1] * 16;
                const dn = encode[colorTable][j + 1]['lower'][key2];
                pouch.color[colorTable][t2] = up + dn;
            }
        }

        bulkOps.push({
            insertOne: {
                document: pouch,
            },
        });
    }
    // BulkWrite 실행
    if (bulkOps.length > 0) {
        await client.bulkWrite(bulkOps);
    }
};


module.exports = {totalGet}


