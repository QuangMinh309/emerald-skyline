import { Link } from "react-router-dom";

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col">
			<section className="flex-1 bg-gradient-to-br from-third/50 to-white flex items-center justify-center px-6">
				<div className="text-center max-w-5xl">
					<h1 className="text-4xl md:text-6xl font-bold text-main mb-6 tracking-tight">
						Emerald Residence
					</h1>

					<p className="text-lg md:text-xl text-gray-700 mb-10 leading-relaxed">
						Nơi cuộc sống thăng hoa – An cư trọn vẹn
					</p>

					<p className="text-base md:text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
						Hệ thống quản lý chung cư hiện đại, minh bạch, tiện lợi. Được thiết
						kế dành riêng cho cư dân và ban quản lý Emerald Residence.
					</p>

					<div className="flex flex-col sm:flex-row gap-6 justify-center">
						<Link to="/about">
							<button
								type="button"
								className="px-10 py-5 bg-main text-white rounded-full text-lg font-medium hover:bg-main/90 transition shadow-lg"
							>
								Tìm hiểu thêm
							</button>
						</Link>

						<a
							href="#features"
							className="px-10 py-5 border-2 border-main text-main rounded-full text-lg font-medium hover:bg-main hover:text-white transition"
						>
							Tính năng nổi bật
						</a>
					</div>
				</div>
			</section>

			<section id="features" className="py-20 bg-white">
				<div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-center">
					<div className="p-8 hover:shadow-xl transition rounded-2xl">
						<div className="text-4xl mb-4">Lock</div>
						<h3 className="text-xl font-semibold text-main mb-3">
							An toàn 24/7
						</h3>
						<p className="text-gray-600">
							Camera, bảo vệ, kiểm soát ra vào thông minh
						</p>
					</div>

					<div className="p-8 hover:shadow-xl transition rounded-2xl">
						<div className="text-4xl mb-4">Bell</div>
						<h3 className="text-xl font-semibold text-main mb-3">
							Phí minh bạch
						</h3>
						<p className="text-gray-600">
							Xem hóa đơn, thanh toán online dễ dàng
						</p>
					</div>

					<div className="p-8 hover:shadow-xl transition rounded-2xl">
						<div className="text-4xl mb-4">Wrench</div>
						<h3 className="text-xl font-semibold text-main mb-3">
							Sửa chữa nhanh
						</h3>
						<p className="text-gray-600">
							Gửi yêu cầu – theo dõi tiến độ realtime
						</p>
					</div>
				</div>
			</section>

			<footer className="py-8 bg-main text-white text-center">
				<p className="text-sm">
					© 2025 Emerald Residence. All rights reserved.
				</p>
			</footer>
		</div>
	);
}
