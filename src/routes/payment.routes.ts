import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller.ts";
import { limiter } from "../middlewares/rate-limiter.ts";

const router = Router();
const paymentController = new PaymentController();

router.post("/create", paymentController.create);
router.get('/status/:reference_key', limiter, paymentController.checkStatus);
router.post('/simulate-pay', paymentController.simulatePay);
router.get('/report-excel', paymentController.reportExcel);
router.get('/report-pdf', paymentController.reportPdf);

export default router