const {groupClient} = require("./MongDB");
const getMain = async () => {
    const aPot = await groupClient.aggregate([{$group: {_id: "$_id.a"}}]).toArray();
    const colorSet = await groupClient.aggregate([{$project: {_id: "$_id"}}]).toArray();
    return {aPot: aPot, colorSet: colorSet};
}

module.exports = {getMain};