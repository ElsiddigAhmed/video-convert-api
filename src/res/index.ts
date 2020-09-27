import multer from "multer";

class Storage {
  private storagePath: string;
  constructor(path: string) {
    this.storagePath = path;
  }

  public saveToFile() {
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        // ...
      },
      filename: function (req, file, cb) {
        //   ...
      },
    });
  }
}

export const StorageAPI = new Storage(process.env.STORAGE_PATH);
