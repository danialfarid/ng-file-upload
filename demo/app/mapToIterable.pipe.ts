import {Pipe} from "@angular/core";
@Pipe({
    name: 'mapToIterable'
})
export class MapToIterable {
    transform(dict: Object): Array<any> {
        var a = [];
        for (var key in dict) {
            if (dict.hasOwnProperty(key)) {
                a.push({key: key, value: dict[key]});
            }
        }
        return a;
    }
}