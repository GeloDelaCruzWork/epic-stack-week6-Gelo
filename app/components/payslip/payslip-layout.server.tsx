import type { ReactNode } from 'react'
import QRCode from 'qrcode'

export interface PayslipData {
	employeeId: string
	employeeNo: string
	employeeName: string
	email?: string
	position?: string
	department?: string
	payPeriod: {
		id: string
		startDate: string
		endDate: string
		month: string
		year: string
	}
	earnings: {
		basicPay: number
		overtimePay: number
		nightDiffPay: number
		holidayPay: number
		allowances: Array<{ name: string; amount: number }>
		totalEarnings: number
	}
	deductions: {
		absences: number
		tardiness: number
		loans: Array<{ type: string; amount: number }>
		sssEE: number
		philhealthEE: number
		hdmfEE: number
		withholdingTax: number
		otherDeductions: Array<{ name: string; amount: number }>
		totalDeductions: number
	}
	netPay: number
	verificationUrl?: string
	qrCodeDataUrl?: string
	status?: 'DRAFT' | 'APPROVED' | 'PAID'
}

function formatCurrency(amount: number | string | any): string {
	// Handle Prisma Decimal type which comes as an object
	let numAmount: number

	if (amount && typeof amount === 'object' && !isNaN(amount)) {
		// Prisma Decimal - convert to string first then to number
		numAmount = Number(amount.toString())
	} else if (typeof amount === 'string') {
		numAmount = parseFloat(amount)
	} else if (typeof amount === 'number') {
		numAmount = amount
	} else {
		// Fallback - try to convert whatever we have
		numAmount = Number(amount)
	}

	// Check for NaN and provide fallback
	if (isNaN(numAmount)) {
		console.warn('Invalid amount for currency formatting:', amount)
		numAmount = 0
	}

	return new Intl.NumberFormat('en-PH', {
		style: 'currency',
		currency: 'PHP',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(numAmount)
}

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString('en-PH', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

interface PayslipLayoutProps {
	data: PayslipData
	showQRCode?: boolean
	watermark?: string
}

export function PayslipLayout({
	data,
	showQRCode = false,
	watermark,
}: PayslipLayoutProps) {
	return (
		<div className="payslip">
			{watermark && <div className="payslip-watermark">{watermark}</div>}

			<div className="payslip-content">
				{/* Header */}
				<div className="payslip-header">
					<h1 className="payslip-company-name">Your Company Name</h1>
					<p className="text-center text-sm text-gray-600">
						123 Business Street, City, Country
					</p>
					<h2 className="payslip-title">Employee Payslip</h2>
				</div>

				{/* Employee Information */}
				<div className="payslip-employee-info">
					<div className="payslip-info-item">
						<span className="payslip-info-label">Employee No:</span>
						<span>{data.employeeNo}</span>
					</div>
					<div className="payslip-info-item">
						<span className="payslip-info-label">Name:</span>
						<span>{data.employeeName}</span>
					</div>
					<div className="payslip-info-item">
						<span className="payslip-info-label">Position:</span>
						<span>{data.position || 'N/A'}</span>
					</div>
					<div className="payslip-info-item">
						<span className="payslip-info-label">Department:</span>
						<span>{data.department || 'N/A'}</span>
					</div>
					<div className="payslip-info-item">
						<span className="payslip-info-label">Pay Period:</span>
						<span>
							{formatDate(data.payPeriod.startDate)} -{' '}
							{formatDate(data.payPeriod.endDate)}
						</span>
					</div>
					<div className="payslip-info-item">
						<span className="payslip-info-label">Email:</span>
						<span>{data.email || 'N/A'}</span>
					</div>
				</div>

				{/* Earnings Section */}
				<div className="payslip-section">
					<h3 className="payslip-section-title">Earnings</h3>
					<table className="payslip-table">
						<tbody>
							<tr>
								<td>Basic Pay</td>
								<td className="amount">
									{formatCurrency(data.earnings.basicPay)}
								</td>
							</tr>
							{data.earnings.overtimePay > 0 && (
								<tr>
									<td>Overtime Pay</td>
									<td className="amount">
										{formatCurrency(data.earnings.overtimePay)}
									</td>
								</tr>
							)}
							{data.earnings.nightDiffPay > 0 && (
								<tr>
									<td>Night Differential</td>
									<td className="amount">
										{formatCurrency(data.earnings.nightDiffPay)}
									</td>
								</tr>
							)}
							{data.earnings.holidayPay > 0 && (
								<tr>
									<td>Holiday Pay</td>
									<td className="amount">
										{formatCurrency(data.earnings.holidayPay)}
									</td>
								</tr>
							)}
							{data.earnings.allowances.map((allowance, idx) => (
								<tr key={idx}>
									<td>{allowance.name}</td>
									<td className="amount">{formatCurrency(allowance.amount)}</td>
								</tr>
							))}
							<tr className="border-t font-bold">
								<td>Total Earnings</td>
								<td className="amount">
									{formatCurrency(data.earnings.totalEarnings)}
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				{/* Deductions Section */}
				<div className="payslip-section">
					<h3 className="payslip-section-title">Deductions</h3>
					<table className="payslip-table">
						<tbody>
							{data.deductions.absences > 0 && (
								<tr>
									<td>Absences</td>
									<td className="amount">
										{formatCurrency(data.deductions.absences)}
									</td>
								</tr>
							)}
							{data.deductions.tardiness > 0 && (
								<tr>
									<td>Tardiness</td>
									<td className="amount">
										{formatCurrency(data.deductions.tardiness)}
									</td>
								</tr>
							)}
							{data.deductions.loans.map((loan, idx) => (
								<tr key={idx}>
									<td>{loan.type}</td>
									<td className="amount">{formatCurrency(loan.amount)}</td>
								</tr>
							))}
							<tr>
								<td>SSS Contribution</td>
								<td className="amount">
									{formatCurrency(data.deductions.sssEE)}
								</td>
							</tr>
							<tr>
								<td>PhilHealth Contribution</td>
								<td className="amount">
									{formatCurrency(data.deductions.philhealthEE)}
								</td>
							</tr>
							<tr>
								<td>Pag-IBIG Contribution</td>
								<td className="amount">
									{formatCurrency(data.deductions.hdmfEE)}
								</td>
							</tr>
							<tr>
								<td>Withholding Tax</td>
								<td className="amount">
									{formatCurrency(data.deductions.withholdingTax)}
								</td>
							</tr>
							{data.deductions.otherDeductions.map((deduction, idx) => (
								<tr key={idx}>
									<td>{deduction.name}</td>
									<td className="amount">{formatCurrency(deduction.amount)}</td>
								</tr>
							))}
						</tbody>
						<tbody className="border-t-2">
							<tr className="font-bold">
								<th>Total Deductions</th>
								<th className="amount">
									{formatCurrency(data.deductions.totalDeductions)}
								</th>
							</tr>
						</tbody>
					</table>
				</div>

				{/* Net Pay */}
				<div className="payslip-totals">
					<div className="payslip-total-row grand-total">
						<span>NET PAY</span>
						<span>{formatCurrency(data.netPay)}</span>
					</div>
				</div>

				{/* Signatures */}
				<div className="payslip-signatures">
					<div className="payslip-signature-block">
						<div className="payslip-signature-line"></div>
						<div className="payslip-signature-label">Employee Signature</div>
					</div>
					<div className="payslip-signature-block">
						<div className="payslip-signature-line"></div>
						<div className="payslip-signature-label">Authorized Signature</div>
					</div>
				</div>

				{/* QR Code */}
				{showQRCode && data.qrCodeDataUrl && (
					<img
						src={data.qrCodeDataUrl}
						alt="Verification QR Code"
						className="payslip-qr-code"
					/>
				)}

				{/* Footer */}
				<div className="payslip-footer">
					<p>This is a computer-generated payslip.</p>
					<p>For any discrepancies, please contact the HR department.</p>
				</div>
			</div>
		</div>
	)
}

interface PayslipSheetProps {
	payslips: PayslipData[]
	showQRCode?: boolean
	watermark?: string
}

export function PayslipSheet({
	payslips,
	showQRCode = false,
	watermark,
}: PayslipSheetProps) {
	// Group payslips into pairs for 2-per-page layout
	const sheets: PayslipData[][] = []
	for (let i = 0; i < payslips.length; i += 2) {
		sheets.push(payslips.slice(i, i + 2))
	}

	return (
		<>
			{sheets.map((sheetPayslips, sheetIndex) => (
				<div key={sheetIndex} className="payslip-sheet">
					{sheetPayslips.map((payslip) => (
						<PayslipLayout
							key={payslip.employeeId}
							data={payslip}
							showQRCode={showQRCode}
							watermark={watermark}
						/>
					))}
					{/* If only one payslip in the last sheet, add empty space */}
					{sheetPayslips.length === 1 && <div className="payslip" />}
				</div>
			))}
		</>
	)
}

// Server-side function to generate QR codes for payslips
export async function generateQRCodes(
	payslips: PayslipData[],
): Promise<PayslipData[]> {
	return Promise.all(
		payslips.map(async (payslip) => {
			if (payslip.verificationUrl) {
				const qrCodeDataUrl = await QRCode.toDataURL(payslip.verificationUrl, {
					width: 80,
					margin: 0,
				})
				return { ...payslip, qrCodeDataUrl }
			}
			return payslip
		}),
	)
}
