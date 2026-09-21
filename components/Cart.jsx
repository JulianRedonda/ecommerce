import {motion,AnimatePresence} from "framer-motion";
import { formatPrice } from "../src/utils/catalog.js";

export default function Cart({
    isCartOpen,
    setIsCartOpen,
    cart,
    getPrecioActual,
    decreaseQty,
    increaseQty,
    handleQtyInput,
    handleKeyDown,
    removeItem,
    itemAEliminar,
    setItemAEliminar,
    hayNoDisponibles,
    qtyWarning,
    total,
    sendWhatsApp
}) {
    return(
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Overlay Oscuro detras del carrito */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black z-40"
                    />
                    {/* Contenedor del Carrito Desplegable */}
                    <motion.div 
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "tween", duration: 0.3 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 p-5 flex flex-col shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black tracking-tighter">TU CARRITO</h2>
                            <button onClick={() => setIsCartOpen(false)} className="text-neutral-400 hover:text-black">
                                <i data-lucide="x" className="w-6 h-6"></i>
                            </button>
                        </div>
                        {/* Contenedor de Items con Scroll */}
                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 no-scrollbar">
                            {hayNoDisponibles && cart.length > 0 &&(
                                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3 mb-2">
                                    <p className="text-sm font-bold text-neutral-800">
                                        Algunos productos ya no están disponibles
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Quedan marcados y no se incluyen en el total.
                                    </p>
                                </div>
                            )}
                            <AnimatePresence mode="popLayout">
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                                        <i
                                            data-lucide="shopping-basket"
                                            className="w-16 h-16 text-neutral-300 mb-6"
                                        ></i>
                                        <h2 className="text-2xl font-bold text-neutral-700">
                                            Tu carrito está vacío
                                        </h2>
                                        <p className="mt-3 text-neutral-400 leading-relaxed max-w-xs">
                                            Agregá algunos productos para comenzar tu pedido.
                                        </p>
                                        <button
                                            onClick={() => setIsCartOpen(false)}
                                            className="mt-8 px-8 py-3 rounded-full bg-black text-white font-semibold hover:scale-105 transition"
                                        >
                                            Seguir comprando
                                        </button>
                                    </div>
                                ) :(cart.map(item => {
                                    const noDisponible =
                                        item.disponibilidad === "retirado" ||
                                        item.disponibilidad === "sin_stock";
                                        const sinStockDisponible = Number(item.qty) >= Number(item.stock);
                                        return (
                                            <motion.div
                                                key={item.sku}
                                                layout="position"
                                                initial={{ opacity: 0, x: 50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 100 }}
                                                transition={{ duration: 0.25 }}
                                                className={`relative overflow-hidden flex gap-6 items-center p-2 rounded-[2.2rem] border border-transparent hover:border-neutral-50 transition-colors ${
                                                    noDisponible ? "opacity-50" : ""
                                                }`}
                                            >
                                                <img
                                                    src={item.imagenCarrito || item.imagenes?.[0]}
                                                    className="w-24 h-28 object-cover rounded-[2rem] shrink-0"
                                                    alt={item.descripcion}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    {/* TÍTULO */}
                                                    <h4 className="font-bold text-lg uppercase leading-none mb-3 break-words">
                                                        {item.descripcion}
                                                    </h4>
                                                    {item.disponibilidad === "retirado" && (
                                                        <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
                                                        Ya no está a la venta
                                                            <span className="block mt-1 normal-case tracking-normal font-medium text-neutral-500">
                                                                Se retiró del catálogo.
                                                            </span>
                                                        </p>
                                                    )}
                                                    {item.disponibilidad === "sin_stock" && (
                                                        <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
                                                            Sin stock
                                                            <span className="block mt-1 normal-case tracking-normal font-medium text-neutral-500">
                                                                Se agotó.
                                                            </span>
                                                        </p>
                                                    )}
                                                    {item.disponibilidad === "stock_ajustado" && (
                                                        <p className="text-[11px] text-neutral-400 mb-2">
                                                            Ajustamos la cantidad al stock actual.
                                                        </p>
                                                    )}
                                                    {/* ATRIBUTOS */}
                                                    <div className="text-xs text-neutral-400 space-y-1">
                                                        {Object.entries(item.variante?.atributos || {}).map(
                                                            ([nombre, valor]) => {
                                                                if (nombre === "color") {
                                                                    return valor?.nombre ? (
                                                                        <p key={nombre}>
                                                                            Color: {valor.nombre}
                                                                        </p>
                                                                    ) : null;
                                                                }
                                                                if (!valor) return null;
                                                                const nombreFormateado =
                                                                    nombre.charAt(0).toUpperCase() +
                                                                    nombre.slice(1).toLowerCase();
                                                                return (
                                                                    <p key={nombre}>
                                                                        {nombreFormateado}: {valor}
                                                                    </p>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                    {/* CONTROLES + SUBTOTAL */}
                                                    <div className="flex items-center justify-between gap-3 mt-3">
                                                        {/* CANTIDAD */}
                                                        {noDisponible ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItem(item.sku)}
                                                                className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black"
                                                            >
                                                                Quitar
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5">
                                                                <button
                                                                    onClick={() => decreaseQty(item.sku)}
                                                                    className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-black hover:text-white active:scale-75 transition-all flex items-center justify-center font-bold text-xs"
                                                                >
                                                                    {item.qty === 1 ? "🗑️" : "−"}
                                                                </button>
                                                                <input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    pattern="[0-9]*"
                                                                    value={item.qty}
                                                                    onChange={(e) => handleQtyInput(item.sku, e.target.value)}
                                                                    onKeyDown={(e) => handleKeyDown(e, item.sku)}
                                                                    className="w-10 text-center border rounded-lg py-1 font-bold text-sm"
                                                                />
                                                                <div className="relative group">
                                                                    <button
                                                                        onClick={() => {
                                                                            const subtotal = getPrecioActual(item) * Number(item.qty);
                                                                            const digitos = Math.floor(subtotal).toString().length;
                                                                            if (itemAEliminar === item.sku) {
                                                                                setItemAEliminar(null);
                                                                            }
                                                                            increaseQty(item.sku);
                                                                        }}
                                                                        disabled={sinStockDisponible}
                                                                        className={`w-7 h-7 rounded-full transition flex items-center justify-center font-bold text-xs
                                                                            ${
                                                                                sinStockDisponible
                                                                                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                                                                                    : "bg-neutral-100 hover:bg-black hover:text-white active:scale-75"
                                                                            }
                                                                        `}
                                                                    >
                                                                        +
                                                                    </button>
                                                                    {sinStockDisponible && (
                                                                        <div className=" pointer-events-none absolute bottom-full right-0 mb-2 px-3 py-2 
                                                                                            rounded-xl bg-[#0B051D] text-white text-[10px] font-bold
                                                                                            whitespace-nowrap shadow-xl opacity-0 translate-y-1 group-hover:opacity-100
                                                                                            group-hover:translate-y-0 transition-all duration-200 z-50"
                                                                        >
                                                                            No hay más stock disponible
                                                                            <span
                                                                                className="absolute top-full right-3 border-4 border-transparent border-t-[#0B051D]
                                                                                "
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {/* SUBTOTAL */}
                                                        {noDisponible ? (
                                                            <p className="font-black text-neutral-300 line-through">
                                                                {formatPrice(getPrecioActual(item) * Number(item.qty || 0))}
                                                            </p>
                                                        ) : (
                                                            <p className={`font-black text-right tabular-nums whitespace-nowrap shrink-0
                                                                        ${
                                                                            Math.floor(getPrecioActual(item) * Number(item.qty)).toString().length >= 10
                                                                                ? "text-sm"
                                                                                :  Math.floor(getPrecioActual(item) * Number(item.qty)).toString().length >= 9
                                                                                    ? "text-base"
                                                                                    : "text-lg"
                                                                        }
                                                                `}
                                                            >
                                                                {formatPrice(getPrecioActual(item) * Number(item.qty))}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {/* WARNING */}
                                                    <AnimatePresence>
                                                        {qtyWarning === item.sku && (
                                                            <motion.span
                                                                initial={{ opacity: 0, y: -5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -5 }}
                                                                className="text-[11px] text-neutral-400 mt-1 block"
                                                            >
                                                                Máximo {item.stock} unidades
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                                {/* ELIMINAR */}
                                                <div
                                                    onClick={() => removeItem(item.sku)}
                                                    className={`absolute top-0 right-0 h-full w-24 bg-[#0B051D] text-white flex flex-col items-center justify-center 
                                                                gap-1 transition-transform duration-300 cursor-pointer select-none rounded-r-[2rem] 
                                                                    ${
                                                                        itemAEliminar === item.sku
                                                                            ? "translate-x-0"
                                                                            : "translate-x-full"
                                                                    }`
                                                    }
                                                >
                                                    <span className="text-xl">🗑️</span>
                                                    <span className="text-[10px] font-black uppercase tracking-wider">
                                                        Eliminar
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                }))}
                            </AnimatePresence>
                        </div>
                        {/* FOOTER DEL CART*/}
                        {cart.length > 0 && (
                            <div className="mt-auto pt-10 border-t border-neutral-100">
                                <div className="flex justify-between text-3xl font-black mb-8 tracking-tighter" >
                                    <span>TOTAL</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                                <button 
                                    onClick={sendWhatsApp} 
                                    className="w-full bg-black text-white py-6 rounded-full font-bold text-xl hover:scale-[1.02] transition-transform shadow-xl"
                                >
                                    CHECKOUT
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )};
        </AnimatePresence>
    )
}