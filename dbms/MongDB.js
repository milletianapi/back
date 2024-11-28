const encode = require("../query/combined_result.json");
const axios = require('axios');
const mongodb = require("mongodb");

const uri = 'mongodb+srv://yoop80075:whrudwns!048576@cluster0.r9zhf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const mongo = new mongodb.MongoClient(uri,{maxIdleTimeMS: 30*60*1000}).db('mabi');
const client = mongo.collection('pouches');
const viewClient = mongo.collection('views');
const visitClient = mongo.collection('visit');
const totalClient = mongo.collection('total');


let data = {
    "_id": "",
    "date": "2024-10-27",
    "cycle": 1,
    "server": "lute",
    "channel": 42,
    "trade": "tirChonaill",
    "item": []
}

const encodeServer = {
    "lute": "류트",
    "mandolin": "만돌린",
    "harp": "하프",
    "wolf": "울프"
}

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

const KEY = 'live_338dbbe7d121fa299df2de7c28d5d974ada91ff22d2577b0886df5685d3d7ff7efe8d04e6d233bd35cf2fabdeb93fb0d';

const getData = async (date, cycle, server, channel, trade) => {

    const channelnum = Number(channel.split('_')[1]) || 0;

    const { data: resultData } = await axios.get(`https://open.api.nexon.com/mabinogi/v1/npcshop/list`,
        { headers: {'x-nxopen-api-key': KEY},
            params:{
            'npc_name': encodeTrades[trade],
                'server_name': encodeServer[server],
                'channel': channelnum,
            } });
    download(resultData);
        data._id = `${date}_${cycle}_${server}_${channel}_${trade}`;
        data.date = date;
        data.cycle = cycle;
        data.server = server;
        data.channel = channelnum;
        data.trade = trade;
    await saveData(data);
    return data;
}

const download = (response) => {
    const baseOffset = 86;
    const rowStep = 18;
    const colStep = 4;
    const keyLength = 2;
    data.item = response.shop[2].item.map(item => {
        const pouch = {
            item_name: item.item_display_name,
            color: {a: {r: 0, g: 0, b: 0}, b: {r: 0, g: 0, b: 0}, c: {r: 0, g: 0, b: 0}}
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
        return pouch;
    });
};

const readData = async (date, cycle, server, channel, trade) => {
    const query = {
        date: date,
        cycle: cycle,
        server: server,
        channel: Number(channel.split('_')[1]),
        trade: trade
    }
    console.log(query);
    let result = await client.findOne(query);
    console.log(result);
    return result;
}




const visit = async () => {
    try {
        const date = new Date(); // 현재 날짜로 date 객체 생성
        const ymd = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        await visitClient.findOneAndUpdate(
            { _id: ymd },
            { $inc: { viewCount: 1 } },
            { upsert: true }
        );
    } catch (error) {
        console.error("Error updating view count:", error);
    }
};


const viewCount = async () => {
    try {
        const date = new Date(); // 현재 날짜로 date 객체 생성
        const ymd = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        await viewClient.findOneAndUpdate(
            { _id: ymd },
            { $inc: { viewCount: 1 } },
            { upsert: true }
        );
    } catch (error) {
        console.error("Error updating view count:", error);
    }
};

const saveData = async (data) => {
let result = await client.insertOne(data);
console.log(`새로운 문서 ID: ${result.insertedId}`);
}

module.exports = { saveData, readData, getData, viewCount, visit, client, viewClient, visitClient, totalClient}