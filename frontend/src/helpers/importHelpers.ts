interface TypeMapHelper{
    [key:string]:"string"|"number"|"object"|"boolean"
}
type CSVImport<T extends TypeMapHelper>=T extends TypeMapHelper?{
    [K in keyof T]:T[K] extends "string" ?string:T[K] extends "number"?number:T[K] extends "boolean"?boolean:T[K] extends "object"?object: never
}[]:never;
export function importCSVArray(){
    return new Promise<string[][]>((resolve,reject) => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".csv";
        fileInput.addEventListener("change", (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            file?.text().then((csvText) => {
                resolve([...csvText.trimEnd().matchAll(/(?:^|,)(?:"((?:[^"]|"")*)"|([^",\r\n]*))(\r?\n)?/gm)]
                    .reduce((out, curr) => {
                        out[out.length - 1].push(curr[1] ?? curr[2])
                        if (curr[3]) {
                            out.push([]);
                        }
                        return out;
                    }, [[]] as string[][]));
            }).catch(reject);
        });
        fileInput.click();
    })
}
export async function importCSV<T extends TypeMapHelper>(typeMap:T){
    const raw = await importCSVArray();
    const [header,...data] = raw;
    const headerChecker = new Set(Object.keys(typeMap));
    if(headerChecker.size!==header.length){
        throw new Error(`${JSON.stringify(header)} headers does not match ${JSON.stringify([...headerChecker.values()])}`);
    }
    header.forEach((value)=>{
        if(!headerChecker.has(value)){
            throw new Error(`"${value}" is duplicated or is not in the remaining ${JSON.stringify([...headerChecker.values()])} headers`);
        }
        headerChecker.delete(value)
    });
    if(headerChecker.size!==0){
        throw new Error("not enough headers");
    }
    return data.map((data)=>{
        if(data.length!==header.length){
            throw new Error("column length does not match headers");
        }
        return Object.fromEntries(data.map((v,i)=>{
            let val=v;
            if(typeMap[header[i]]!=="string") {
                try {
                    val = JSON.parse(v);
                } catch (e) {
                    // be sad it's still a string
                }
            }
            if(typeof val !== typeMap[header[i]]){
                throw new Error(`${JSON.stringify(val)} is not of type ${typeMap[header[i]]}`);
            }
            return [header[i],val];
        }));
    }) as CSVImport<T>;
}