import {ClassConstructor, instanceToPlain, plainToInstance} from 'class-transformer'

export class JsonUtils {

    public static toJson(obj: any): Record<string, any> {
        return instanceToPlain(obj)
    }

    public static toJsonString(obj: any, pretty: boolean = false): string {
        if (pretty) {
            return JSON.stringify(obj, null, 2)
        }
        return JSON.stringify(this.toJson(obj))
    }

    public static readJson<T>(json: any, cls: ClassConstructor<T>): T {
        return plainToInstance(cls, json)
    }

    public static readJsonString<T>(jsonString: string, cls: ClassConstructor<T>): T {
        return this.readJson(JSON.parse(jsonString), cls)
    }

    public static objToOtherObj<T>(obj: any, cls: ClassConstructor<T>): T {
        let jsonString = this.toJsonString(obj)
        return this.readJsonString(jsonString, cls)
    }
}
