import { AppDataSource } from "../data-source.ts";
import { Payment } from "../entities/Payment.ts";
import { randomUUID } from "node:crypto";
import { PaymentMethod, PaymentStatus } from "../types/payment_types.ts";
import axios from 'axios'
import QRCode from 'qrcode'

export class PaymentService {
    private paymentRepository = AppDataSource.getRepository(Payment);

    async getPayments() {
        return await this.paymentRepository.find();
    }

    async checkTransaction(trxId: string) {
        const response = await axios.get(
            `${process.env.GER_API_URL}/..../${trxId}`, {
                headers: {
                    "x-api-key": process.env.GER_API_KEY
                }
            }
        )

        return response.data
    }

    async createPayment(paymentData: Payment) {
        const referenceKey = `REF-${randomUUID()}`

        let qrString: string | null = null;
        let qrImage: string | null = null;

        let vaNumber: number | null = null;

        if (paymentData.method === PaymentMethod.QRIS) {
            qrString =  `http://${process.env.IP_LAPTOP}:3000/api/payments/status/${referenceKey}`

            qrImage = await QRCode.toDataURL(qrString);
        } else if (paymentData.method === PaymentMethod.TF) {
            vaNumber = Math.floor(100000000000000 + Math.random() * 900000000000000)
        }

        const newPayment = this.paymentRepository.create({
            ...paymentData,
            reference_key: referenceKey,
            status: paymentData.method === PaymentMethod.CASH ? PaymentStatus.PAID : PaymentStatus.PENDING,
            qrString,
            vaNumber,
            expiredAt: Date.now() + 8 * 60 * 1000
        });

        const payment = await this.paymentRepository.save(newPayment);
        
        return {
            ...payment,
            qrImage
        }
    }

    async checkStatus(refKey: string) {
        const payment = await this.paymentRepository.findOne({
            where: {
                reference_key: refKey
            }
        })
        if (!payment) {
            return null
        }

        if (payment.status === PaymentStatus.PENDING && Date.now() >= payment.expiredAt ) {
            payment.status = PaymentStatus.EXPIRED
            await this.paymentRepository.save(payment);
        }

        return payment;
    }

    async simulatePay(refKey: string, amountPaid?: number) {
        const payment = await this.paymentRepository.findOne({
            where: {
                reference_key: refKey
            }
        })
        if (!payment) {
            return null
        }

        const createPaymentError = (message: string) => {
            const error = new Error(message) as Error & { statusCode: number };
            error.statusCode = 400;
            return error;
        };

        if (amountPaid as number !== payment.amount) {
            throw createPaymentError('gagal melakukan pembayaran')
        }

        if (payment.status === PaymentStatus.PAID) {
            throw createPaymentError('payment sudah dibayar sebelumnya!')
        } 

        else if (payment.status === PaymentStatus.PENDING && Date.now() >= payment.expiredAt ) {
            payment.status = PaymentStatus.EXPIRED
            await this.paymentRepository.save(payment);

            throw createPaymentError('payment telah expired!')
        }

        payment.status = PaymentStatus.PAID
        
        return await this.paymentRepository.save(payment);
    }

}