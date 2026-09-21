export default function Navbar({
    cart,
    setIsCartOpen,
    setCartAlerta,
    cartAlerta,
    navbarRef,
    isCatalogOpen,
    setIsCatalogOpen
}) {
     return (
                <nav ref={navbarRef} 
                     className="fixed top-0 z-40 w-full px-8 py-6 flex justify-between items-center 
                                backdrop-blur-xl bg-white/80 border-b border-neutral-100"
                >
                    <button
                        onClick={() => setIsCatalogOpen(true)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm 
                                    font-medium transition-all duration-200
                                    ${
                                        isCatalogOpen
                                            ? "bg-black text-white"
                                            : "bg-neutral-900 text-white hover:bg-neutral-800"
                                    }
                        `}
                    >
                        <i data-lucide="grid-2x2" className="w-4 h-4"></i>
                        <span>Catálogo</span>
                    </button>
                    <div className="text-2xl font-extrabold tracking-tighter">
                        VANNA COMFY.
                    </div>
                    <div className="relative">
                        <button type="button" 
                                onClick={setIsCartOpen}
                                className="relative p-3 bg-black text-white 
                                rounded-full hover:scale-110 transition-transform"
                            >
                            <i data-lucide="shopping-bag" className="w-5 h-5"></i>
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white leading-none">
                                    {cart.reduce((a, b) => a + Number(b.qty || 0), 0)}
                                </span>
                            )}
                        </button>
                        {cartAlerta && (
                            <div className=" absolute top-full right-0 mt-3 z-50 w-56 bg-[#0B051D] text-white rounded-2xl px-4 py-3 shadow-2xl">
                                <p className="text-xs font-bold leading-snug">
                                    Hubo cambios en tu pedido.
                                    Revisalo.
                                </p>
                                <span className=" absolute -top-1.5 right-5 w-3 h-3 bg-[#0B051D] rotate-45"/>
                            </div>
                        )}
                    </div>
                </nav>
            );
        }
