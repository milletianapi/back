import response from "./response_1729811628723.json";

export const enCoder = () => {
    response.shop[2].item.map(item => {

        return (
            {
                item_name: item.item_display_name,
                color:{
                    a:{r:255, g:255, b:255},
                    b:{r:255, g:255, b:255},
                    c:{r:255, g:255, b:255}
                }
            }
        )

    })
}


const download = async () => {
    const baseOffset = 86;
    const rowStep = 18;
    const colStep = 4;
    const keyLength = 2;

    for (let i = 0; i < 3; i++) {
        let color = '';
        for (let j = 0; j < 3; j++) {
            let up = 0;
            let dn = 0;

            for (let k = 0; k < 2; k++) {
                const offset = baseOffset + (i * rowStep) + (j * colStep) + (k * keyLength);
                const key = response.shop[2].item[0].item_display_name.substring(offset, offset + keyLength);
                console.log(key)
                try {
                    //const response = await axios.get(`http://localhost:8080/${i + 1}:${j + 1}:${k + 1}:${key}`);
                    if (k === 0) {
                        //up = response.data * 16;
                    } else {
                        //dn = response.data;
                    }
                } catch (error) {
                    console.error(`Error fetching data for ${i + 1}:${j + 1}:${k + 1}:${key}`, error);
                }
            }
            color += `${up + dn}, `;
        }
    }
};

download()