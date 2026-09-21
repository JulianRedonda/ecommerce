export default function Footer() {
    return (
        <footer className="bg-white border-t border-neutral-100 pt-20 pb-10 mt-20">
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16 items-start">
                    {/* Columna 1: Branding y Mascota */}
                    <div className="md:col-span-4 flex flex-col gap-6">
                        <div>
                            <div className="text-3xl font-extrabold tracking-tighter mb-2">VANNA COMFY.</div>
                        </div>
                        
                        {/* LA MASCOTA*/}
                        <div className="relative w-44 h-44 bg-[#FFF9F2] rounded-[2.5rem] flex items-center justify-center overflow-visible group border border-orange-100/50">
                            <img 
                                src="public/bear1.png" 
                                alt="Vanna Bear" 
                                className="w-[280px] h-[280px] object-contain transition-transform group-hover:scale-110 duration-500"
                            />
                        </div>
                    </div>

                    {/* Columna 2: Navegación */}
                    <div className="md:col-span-2">
                        <h4 className="font-black uppercase text-[10px] tracking-[0.2em] mb-8 text-neutral-400">Explorar</h4>
                        <ul className="space-y-4 text-sm font-bold">
                            <li><a href="#" className="text-neutral-500 hover:text-black transition-colors">Invierno '26</a></li>
                            <li><a href="#" className="text-neutral-500 hover:text-black transition-colors">Pijamas</a></li>
                            <li><a href="#" className="text-neutral-500 hover:text-black transition-colors">Accesorios</a></li>
                        </ul>
                    </div>

                    {/* Columna 3: Ayuda */}
                    <div className="md:col-span-2">
                        <h4 className="font-black uppercase text-[10px] tracking-[0.2em] mb-8 text-neutral-400">Ayuda</h4>
                        <ul className="space-y-4 text-sm font-bold">
                            <li><a href="#" className="text-neutral-500 hover:text-black transition-colors">Talles</a></li>
                            <li><a href="#" className="text-neutral-500 hover:text-black transition-colors">Envíos</a></li>
                            <li><a href="#" className="text-neutral-500 hover:text-black transition-colors">FAQs</a></li>
                        </ul>
                    </div>

                    {/* Columna 4: Redes Sociales */}
                    <div className="md:col-span-4">
                        <h4 className="font-black uppercase text-[10px] tracking-[0.2em] mb-8 text-neutral-400">Seguinos</h4>
                        <div className="flex flex-col gap-5">
                            {/* Instagram */}
                            <a href="#" className="flex items-center gap-4 group">
                                <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-2xl shadow-lg transition-transform group-hover:scale-110">
                                    <i data-lucide="square-stop" className="w-10 h-10 block"></i>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Instagram</span>
                                    <span className="text-sm font-bold text-neutral-800">@vanna.comfy</span>
                                </div>
                            </a>

                            {/* WhatsApp */}
                            <a href={`https://wa.me/5491162873764`} target="_blank" className="flex items-center gap-4 group">
                                <div className="w-14 h-14 flex items-center justify-center bg-[#25D366] text-white rounded-2xl shadow-lg transition-transform group-hover:scale-110">
                                    <i data-lucide="message-circle" className="w-10 h-10 block"></i>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">WhatsApp</span>
                                    <span className="text-sm font-bold text-neutral-800">+54 9 11 6287-3764</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Barra Final */}
                <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-black">
                    <p className=" mb-5 ms-5 text-[10px] text-neutral-400 font-bold uppercase tracking-[0.3em]">
                        © 2026 VANNA COMFY. Hecho con ❤️ para tu descanso.
                    </p>
                    <div className="flex gap-2 items-center -mt-8 me-4">
                        <img src="https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/mastercard-alt.svg?sanitize=true" className="h-8 w-16 object-contain opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-110 transition-all duration-500" alt="Mastercard" />
                        <img src="https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/visa.svg?sanitize=true" className="h-8 w-16 object-contain opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-110 transition-all duration-500" alt="Visa" />
                        <img src="https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/american-express.svg?sanitize=true" className="h-8 w-16 object-contain opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-110 transition-all duration-500" alt="Amex" />
                        <img src="https://www.freelogovectors.net/wp-content/uploads/2019/02/Mercadopago-logo.png" className="bg-white h-8 w-16 object-contain opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-110 transition-all duration-500" alt="Mercadopago" />
                        <img src="https://logosenvector.com/logo/img/modo-37330.png" className="h-8 w-16 object-contain opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-110 transition-all duration-500" alt="Modo" />
                    </div>
                </div>
            </div>
        </footer>
    );
}