export interface ISerializer {
    serialize(o: any): string;
    deserialize<T>(text: string): T;
}

export class JsonSerializer implements ISerializer {

    private static isoDateStringRegex: RegExp = /^\d{4}\-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?([\+\-]\d{2}:\d{2}|[A-Z])$/i;

    serialize(o: any): string {
        const result = JSON.stringify(o);
        return result;
    }

    deserialize<T>(text: string): T {
        const result = JSON.parse(text, (key: string, value: any) => {
            if (typeof value === "string" && JsonSerializer.isIsoDateString(value)) {
                value = new Date(value);
            }
            return value;
        });

        return result;
    }

    private static isIsoDateString(text: string): boolean {
        return JsonSerializer.isoDateStringRegex.test(text);
    }

}