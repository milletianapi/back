const mongodb = require("mongodb");
const uri = 'mongodb+srv://yoop80075:whrudwns!048576@cluster0.r9zhf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const mongo = new mongodb.MongoClient(uri);
const db = mongo.db('mabi');
const mabistatsDb = mongo.db('mabistats');
const coloraClient = mabistatsDb.collection('colora');
const colorbClient = mabistatsDb.collection('colorb');
const colorcClient = mabistatsDb.collection('colorc');

const updateCollection = async (collection, data) => {
    for (const item of data) {
        const { _id, count } = item;
        await collection.updateOne(
            { _id }, // 조건: 같은 _id
            { $inc: { count } }, // count 값 증가
            { upsert: true } // 없으면 새로 생성
        );
    }
};

const colorstats = async () => {
    try {
        const colora = await db.collection('total').aggregate([
            { $group: { _id: '$color.a', count: { $sum: 1 } } }
        ]).toArray();

        const colorb = await db.collection('total').aggregate([
            { $group: { _id: '$color.b', count: { $sum: 1 } } }
        ]).toArray();

        const colorc = await db.collection('total').aggregate([
            { $group: { _id: '$color.c', count: { $sum: 1 } } }
        ]).toArray();

        updateCollection(coloraClient, colora);
        updateCollection(colorbClient, colorb);
        updateCollection(colorcClient, colorc);

        console.log("View counts updated successfully.");
    } catch (error) {
        console.error("Error updating view count:", error);
    }
};

module.exports = { colorstats };
