
export const get = (url: string) => {
    return new Promise((resolve,error)=>{
        fetch(url).then(response => response.json())
            .then(data => {
                resolve(data)
            }).catch(e => {
            error(e);
        })
    })
}