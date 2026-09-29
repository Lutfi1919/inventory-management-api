import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller.ts";
import { limiter } from "../middlewares/rate-limiter.ts";
import { apiKeyAuth } from "../middlewares/api-key-auth.ts";

const router = Router();
const paymentController = new PaymentController();

router.post("/create", apiKeyAuth, paymentController.create);
router.get('/status/:reference_key', limiter, paymentController.checkStatus);
router.post('/simulate-pay', apiKeyAuth, paymentController.simulatePay);
router.get('/report-excel', apiKeyAuth, paymentController.reportExcel);
router.get('/report-pdf', apiKeyAuth, paymentController.reportPdf);

export default router