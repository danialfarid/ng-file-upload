export class Uploader {
    public static rename(file, name) {
        file.ngfName = name;
        return file;
    }
}