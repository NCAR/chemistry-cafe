type UndefinedToOptional<T extends BaseCSVImport> =T extends BaseCSVImport? {
    [K in keyof T as undefined extends T[K] ? never : K]: T[K];
} & {
    [K in keyof T as undefined extends T[K] ? K : never]?: T[K];
}:never;
type ReZip<T extends BaseCSVImport>=T extends BaseCSVImport?{
    [K in keyof T]: T[K]
}:never;
type SpreadType<T>=T extends (infer A)[]? A : T;


export type StrType = "string"|"number"|"object"|"boolean"|"undefined"|"null";

interface TypeMapHelper{
    [key:string]:Set<StrType>;
}
interface BaseCSVImport{
    [key:string]:string|number|boolean|object|null|undefined;
}

type StrTypePrimToType<T>=T extends "string" ?string:T extends "number"?number:T extends "boolean"?boolean:T extends "object"?object: T extends "undefined"?undefined: T extends "null"?null: never;
type PrimToStrType<T>=T extends null?"null":T extends string ?"string":T extends number?"number":T extends boolean?"boolean":T extends object?"object": T extends undefined?"undefined":  never;

type StrTypeToType<T> = T extends Set<infer A>? StrTypePrimToType<A> : never;

export type CSVImport<T extends TypeMapHelper>=T extends TypeMapHelper?ReZip<UndefinedToOptional<{
    -readonly [K in keyof T]:StrTypeToType<T[K]>
}>>[]:never;


type TypeMapHelperSets<T extends BaseCSVImport>=T extends BaseCSVImport?{
    [K in keyof T]-?: Set<PrimToStrType<T[K]>>
}:never;


type CreateTypeMapHelper<T extends BaseCSVImport>=T extends BaseCSVImport?{
    [K in keyof T]-?: PrimToStrType<T[K]>[]
}:never;

export function CreateTypeMap<const T extends BaseCSVImport>(typeMap:CreateTypeMapHelper<T>){
    return Object.fromEntries(Object.entries(typeMap).map(([k,v])=>[k,new Set<SpreadType<typeof v>>(Array.isArray(v)?v:[v])])) as TypeMapHelperSets<T>;
}

export function processCSVType<T extends Set<StrType>>(v:string,type:T){
    let val:StrTypePrimToType<StrType>=v;
    if(!v&&type.has("undefined")){
        val=undefined;
    }else if(!type.has("string")){
        try {
            val = JSON.parse(v);
        } catch (e) {
            throw new Error(`${JSON.stringify(val)} is not of type ${JSON.stringify([...type.values()])}`);
        }
    }
    if(!type.has((typeof val) as StrType)){
        throw new Error(`${JSON.stringify(val)} is not of type ${JSON.stringify([...type.values()])}`);
    }
    return val as StrTypeToType<T>
}

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
                        out[out.length - 1].push((curr[1] ?? curr[2]).replace(/""/g, "\""));
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
export function exportCSVArray(data:string[][],filename:string="download"){
    const blob = new Blob([data.map((row)=>`"${row.map((v)=>v.replace(/"/g,"\"\"")).join("\",\"")}"`).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}
export async function importCSV<const T extends TypeMapHelper>(typeMap:T){
    const raw = await importCSVArray();
    const [header,...data] = raw;
    const headerChecker = new Set(Object.keys(typeMap));
    header.forEach((value)=>{
        if(!headerChecker.has(value)){
            throw new Error(`"${value}" is duplicated or is not in the remaining ${JSON.stringify([...headerChecker.values()])} headers`);
        }
        headerChecker.delete(value)
    });
    if(!(headerChecker.size===0 || [...headerChecker.values()].every((v)=>typeMap[v].has("undefined")))){
        throw new Error("not enough headers");
    }
    return data.map((data)=>{
        if(data.length!==header.length){
            console.log(data,header)
            throw new Error("column length does not match headers");
        }
        return Object.fromEntries(data.flatMap((v,i)=>{
            const val = processCSVType(v,typeMap[header[i]]);
            return val === undefined?[]:[[header[i],val]]
        }));
    }) as CSVImport<T>;
}
export function exportCSV<T extends TypeMapHelper>(data:CSVImport<T>,typeMap:T){
    const keys = Object.keys(typeMap);
    const headerRows = Object.fromEntries(keys.map((v,i)=>[v,i]))
    exportCSVArray([keys,...data.map((val)=>Object.entries(val).reduce((row,[k,v])=>(typeMap[k] && (row[headerRows[k]]=(typeMap[k].has("string")&&typeof v==="string")?v:JSON.stringify(v)),row),Array(keys.length).fill("")))]);
    
}