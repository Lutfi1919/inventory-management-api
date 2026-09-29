import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { PaymentService } from '../services/payment.service.ts';
import { PaymentMethod, PaymentStatus } from '../types/payment_types.ts';
import exceljs from 'exceljs';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

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
                    amount: "Rp. " + payment.amount.toLocaleString('id-ID'),
                    method: payment.method.toUpperCase(),
                    status: payment.status.toUpperCase(),
                    payment_instructions: {
                        va_number: payment.vaNumber,
                        expired_at: formattedExpiry.toLocaleString(),
                    },
                }
            } else if (paymentData.method === PaymentMethod.QRIS) {
                formattedResponse = {
                    id: payment.id,
                    reference_key: payment.reference_key,
                    amount: "Rp. " + payment.amount.toLocaleString('id-ID'),
                    method: payment.method.toUpperCase(),
                    status: payment.status.toUpperCase(),
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
                    amount: "Rp. " + payment.amount.toLocaleString('id-ID'),
                    method: payment.method.toUpperCase(),
                    status: payment.status.toUpperCase(),
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
                    amount: "Rp. " + payment.amount.toLocaleString('id-ID'),
                    status: payment.status.toUpperCase(),
                    expired_at: payment.expiredAt ? new Date(Number(payment.expiredAt)).toLocaleString() : null
                }
            })
        } catch (error) {
            next(error)
        }
    }

    simulatePay = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { referenceKey } = req.body;
            const { amountPaid } = req.body;

            const payment = await this.paymentService.simulatePay(referenceKey, amountPaid);
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
                    amount: "Rp. " + payment.amount.toLocaleString('id-ID'),
                    method: payment.method.toUpperCase(),
                    status: payment.status.toUpperCase(),
                    va_number: payment.vaNumber,
                    created_at: payment.createdAt,
                    updated_at: payment.updatedAt
                }
            } else if (payment.method === PaymentMethod.QRIS) {
                formattedResponse = {
                    id: payment.id,
                    reference_key: payment.reference_key,
                    amount: "Rp. " + payment.amount.toLocaleString('id-ID'),
                    method: payment.method.toUpperCase(),
                    status: payment.status.toUpperCase(),
                    qr_string: payment.qrString,
                    created_at: payment.createdAt,
                    updated_at: payment.updatedAt
                }
            } else {
                formattedResponse = {
                    id: payment.id,
                    reference_key: payment.reference_key,
                    amount: "Rp. " + payment.amount.toLocaleString('id-ID'),
                    method: payment.method.toUpperCase(),
                    status: payment.status.toUpperCase(),
                    created_at: payment.createdAt,
                    updated_at: payment.updatedAt
                }
            }

            return res.status(200).json({
                success: true,
                message: "berhasil melakukan pembayaran",
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

            for (const payment of payments) {
                const formattedExpiry = payment.expiredAt ? new Date(Number(payment.expiredAt)).toLocaleString() : '-';

                if (payment.status === PaymentStatus.PENDING && Date.now() >= payment.expiredAt) {
                    payment.status = PaymentStatus.EXPIRED
                }

                const row = worksheet.addRow({
                    id: payment.id,
                    reference_key: payment.reference_key,
                    trx_id: payment.trx_id,
                    method: payment.method.toUpperCase(),
                    amount: "Rp. " + payment.amount.toLocaleString('id-ID'),
                    status: payment.status.toUpperCase(),
                    vaNumber: payment.vaNumber ?? '-',
                    qr: payment.qrString ? '' : '-',
                    expiredAt: formattedExpiry,
                });

                row.height = 100;
                row.alignment = {
                    vertical: 'middle',
                    horizontal: 'center',
                };

                if (payment.qrString) {
                    const qrDataUrl = await QRCode.toDataURL(payment.qrString);
                    const qrBase64 = qrDataUrl.slice(qrDataUrl.indexOf(",") + 1);

                    const imageId = workbook.addImage({
                        base64: qrBase64,
                        extension: "png",
                    });

                    worksheet.addImage(imageId, {
                        tl: { col: 7, row: row.number - 1 },
                        ext: { width: 80, height: 80 },
                        editAs: "oneCell"
                    });
                }
            }

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
            const payments = await this.paymentService.getPayments();
            const doc = new PDFDocument();
            const today = Date.now()

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=payments.pdf");

            doc.pipe(res);
            
            doc.fontSize(18).text("LAPORAN DATA PAYMENT", { align: "center" });
            doc.moveDown();

            doc.fontSize(10).text(`Tanggal Export: ${new Date(today).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`).text(`Total Payment: ${payments.length}`);
            doc.moveDown();

            payments.forEach((payment, index) => {
                const details = [
                    `${index + 1}. Ref Key: ${payment.reference_key}`,
                    `Transaksi: ${payment.trx_id} | Metode: ${payment.method}`,
                    `Jumlah: ${new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                    }).format(payment.amount)} | Status: ${payment.status}`,
                    `VA: ${payment.vaNumber ?? "-"} | Kedaluwarsa: ${payment.expiredAt ? new Date(Number(payment.expiredAt)).toLocaleString("id-ID") : "-"}`,
                ].join("\n");

                const blockHeight = 65;
                const pageBottom = doc.page.height - doc.page.margins.bottom;

                if (doc.y + blockHeight > pageBottom) {
                    doc.addPage();
                }

                doc.fontSize(10).text(details);
                doc.moveDown();
            })

            doc.end();

        } catch (error) {
            next(error)
        }
    }
}