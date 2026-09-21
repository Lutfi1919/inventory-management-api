import multer from "multer";

const storage = multer.memoryStorage();

export const uploadCsv = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        const isCsv = file.originalname.toLowerCase().endsWith(".csv");
        if (!isCsv) {
            return callback(new Error("file harus berformat CSV"));
        }

        callback(null, true);
    }
});