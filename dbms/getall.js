const {totalClient} = require("./MongDB");

const getall = async (filter, options) => {
    const count = await totalClient.countDocuments()
    console.log(count);

    const list = await totalClient.aggregate([
        {
            $match: {
                "color.a": { r: 81, g: 175, b: 118 } // 원하는 a 컬러 값
            }
        },
        {
            $group: {
                _id: {
                    item_name: "$item_name",
                    color: "$color"
                },
                event: {
                    $push: {
                        date: "$date",
                        cycle: "$cycle",
                        server: "$server",
                        channel: "$channel",
                        trade: "$trade"
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                item_name: "$_id.item_name",
                color: "$_id.color",
                event: 1
            }
        }
    ]).toArray();
    console.log(list);
    return list;
}

module.exports = {getall}
