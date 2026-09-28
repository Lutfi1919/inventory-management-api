import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { PaymentService } from '../services/payment.service.ts';
import { PaymentMethod, PaymentStatus } from '../types/payment_types.ts';
import exceljs from 'exceljs';
import PDFDocument from 'pdfkit';

export class PaymentController {
    private paymentService = new PaymentService();

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { ...paymentData } = req.body;

            const schema = Joi.object({
                trx_id: Joi.string().trim().min(5).required().messages({
                    "string.empty": "trx_id wajib diisi",
                    "string.trim": "tidak boleh ada spasi diawal/akhir",
                    "string.min": "trx minimal 5 karakter",
                    "any.required": "trx wajib diisi"
                }),
                method: Joi.string().valid(...Object.values(PaymentMethod)).required().messages({
                    "string.empty": "method wajib diisi",
                    "any.only": "Enum method salah",
                    "any.required": "method wajib diisi"
                }),
                amount: Joi.number().integer().required().messages({
                    "number.empty": "amount wajib diisi",
                    "number.integer": "amount tidak boleh float",
                    "any.required": "amount wajib diisi"
                }),
            })

            const value = await schema.validateAsync(paymentData)

            if (paymentData.amount < 0) {
                return res.status(400).json({
                    success: false,
                    message: "amount tidak boleh negatif"
                })
            }

            const payment = await this.paymentService.createPayment(value);

            const formattedExpiry = new Date(Number(payment.expiredAt))
            let formattedResponse = {}

            if (paymentData.method === PaymentMethod.TF) {
                formattedResponse = {
                    id: payment.id,
                    reference_key: payment.reference_key,
                    amount: payment.amount,
                    method: payment.method,
                    status: payment.status,
                    payment_instructions: {
                        va_number: payment.vaNumber,
                        expired_at: formattedExpiry.toLocaleString(),
                    },
                }
            } else if (paymentData.method === PaymentMethod.QRIS) {
                formattedResponse = {
                    id: payment.id,
                    reference_key: payment.reference_key,
                    amount: payment.amount,
                    method: payment.method,
                    status: payment.status,
                    payment_instructions: {
                        qr_string: payment.qrString,
                        qr_image: payment.qrImage,
                        expired_at: formattedExpiry.toLocaleString(),
                    },
                }
            } else {
                formattedResponse = {
                    id: payment.id,
                    reference_key: payment.reference_key,
                    amount: payment.amount,
                    method: payment.method,
                    status: payment.status,
                    expired_at: formattedExpiry.toLocaleString(),
                }
            }

            return res.status(201).json({ 
                success: true,
                message: "berhasil membuat payment", 
                data: formattedResponse
            })

        } catch (error) {
            next(error)
        }
    }

    checkStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const referenceKey = req.params.reference_key;

            const payment = await this.paymentService.checkStatus(referenceKey as string)
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: "payment not found"
                })
            }

            return res.status(200).json({
                success: true,
                message: "payment found",
                data: {
                    reference_key: payment.reference_key,
                    amount: payment.amount,
                    status: payment.status
                }
            })
        } catch (error) {
            next(error)
        }
    }

    simulatePay = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {referenceKey} = req.body;

            const payment = await this.paymentService.simulatePay(referenceKey as string);
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: "payment not found"
                })
            }

            let formattedResponse = {}

            if (payment.method === PaymentMethod.TF) {
                formattedResponse = {
                    id: payment.id,
                    reference_key: payment.reference_key,
                    amount: payment.amount,
                    method: payment.method,
                    status: payment.status,
                    va_number: payment.vaNumber,
                    created_at: payment.createdAt,
                    updated_at: payment.updatedAt
                }
            } else if (payment.method === PaymentMethod.QRIS) {
                formattedResponse = {
                    id: payment.id,
                    reference_key: payment.reference_key,
                    amount: payment.amount,
                    method: payment.method,
                    status: payment.status,
                    qr_string: payment.qrString,
                    created_at: payment.createdAt,
                    updated_at: payment.updatedAt
                }
            } else {
                formattedResponse = {
                    id: payment.id,
                    reference_key: payment.reference_key,
                    amount: payment.amount,
                    method: payment.method,
                    status: payment.status,
                    created_at: payment.createdAt,
                    updated_at: payment.updatedAt
                }
            }

            return res.status(200).json({
                success: true,
                message: "berhasil membayar payment",
                data: formattedResponse
            })
            
        } catch (error) {
            next(error)
        }
    }

    reportExcel = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payments = await this.paymentService.getPayments();

            const workbook = new exceljs.Workbook();
            const worksheet = workbook.addWorksheet('Payments');

            worksheet.columns = [
                { header: 'Payment ID', key: 'id', width: 15, style: { alignment: { vertical: "middle", horizontal: "center" } } },
                { header: 'Reference Key', key: 'reference_key', width: 50, style: { alignment: { vertical: "middle", horizontal: "center" } } },
                { header: 'Transaction ID', key: 'trx_id', width: 25, style: { alignment: { vertical: "middle", horizontal: "center" } } },
                { header: 'Payment Method', key: 'method', width: 30, style: { alignment: { vertical: "middle", horizontal: "center" } } },
                { header: 'Amount', key: 'amount', width: 30, style: { alignment: { vertical: "middle", horizontal: "center" } } },
                { header: 'Status', key: 'status', width: 30, style: { alignment: { vertical: "middle", horizontal: "center" } } },
                { header: 'VA Number', key: 'vaNumber', width: 30, style: { alignment: { vertical: "middle", horizontal: "center" } } },
                { header: 'QR', key: 'qr', width: 30, style: { alignment: { vertical: "middle", horizontal: "center" } } },
                { header: 'Expired Date', key: 'expiredAt', width: 30, style: { alignment: { vertical: "middle", horizontal: "center" } } },
            ]
            
            payments.forEach(payment => {
                // const qrDataUrl = QRCode.toDataURL(payment.qrString as string);
                
                // const imageId = workbook.addImage({
                    //     base64: qrDataUrl,
                    //     extension: 'png',
                    // });
                if (payment.status === PaymentStatus.PENDING && Date.now() >= payment.expiredAt) {
                    payment.status = PaymentStatus.EXPIRED
                }

                const formattedExpiry = new Date(Number(payment.expiredAt))
                
                worksheet.addRow({
                    id: payment.id,
                    reference_key: payment.reference_key,
                    trx_id: payment.trx_id,
                    method: payment.method,
                    amount: payment.amount,
                    status: payment.status,
                    vaNumber: payment.vaNumber ? payment.vaNumber : '-',
                    // qrString: worksheet.addImage(payment.qrImage, {
                    //     tl: { col: 0, row: 0 },
                    //     ext: { width: 500, height: 200 }
                    // }),
                    expiredAt: payment.expiredAt ? formattedExpiry.toLocaleString() : '-',
                }).alignment = {
                    vertical: 'middle',
                    horizontal: 'center'
                }
            });

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )

            res.setHeader(
                'Content-Disposition',
                'attachment; filename=payments.xlsx'
            );

            await workbook.xlsx.write(res);

            res.end();

        } catch (error) {
            next(error)
        }
    }

    reportPdf = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const doc = new PDFDocument();

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=payments.pdf");
            
            doc.pipe(res);
            
            const payments = await this.paymentService.getPayments();
            
        } catch (error) {
            next(error)
        }
    }
}