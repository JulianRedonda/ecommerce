import {motion,AnimatePresence} from "framer-motion";

import ProductSkeleton from "../components/ProductSkeleton.jsx";
import ProductCard from "../components/ProductCard.jsx";

export default function ProductGrid({
    isLoading,
    itemsPerPage,
    filteredProducts,
    addToCart,
    handleAddFromCatalog,
    updateCartQuantity,
    onSelectProduct,
    searchTerm,
    onResetFilters,
    cart,
    setVariantFilters,
    variantFilters
}) {
    const skeletonCount = itemsPerPage === "all"
                                ? 18
                                : Number(itemsPerPage);
        return (
            <main className="px-8 max-w-7xl mx-auto">
                <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <AnimatePresence mode="popLayout">
                        {isLoading ? (
                            Array.from({length: skeletonCount }).map((_, idx) => (
                                <ProductSkeleton key={`skeleton-${idx}`} />
                            ))
                        ) : filteredProducts.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="col-span-full py-32 text-center"
                            >
                                {Object.keys(variantFilters).length > 0 ? (
                                    <>
                                        <i
                                            data-lucide="sliders-horizontal"
                                            className="w-12 h-12 mx-auto text-neutral-300 mb-6"
                                        />
                                        <h2 className="text-3xl font-bold text-neutral-700">
                                            No hay coincidencias
                                        </h2>
                                        <p className="mt-3 text-neutral-500">
                                            No encontramos productos que coincidan
                                            con los filtros activos.
                                        </p>
                                        <button
                                            onClick={() => setVariantFilters({})}
                                            className="mt-8 px-8 py-3 rounded-full bg-black text-white font-semibold hover:scale-105 transition"
                                        >
                                            Limpiar filtros
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-3xl font-bold text-neutral-700">
                                            No encontramos productos para
                                        </h2>
                                        <p className="mt-3 text-neutral-500">
                                            "<span className="font-semibold">
                                                {searchTerm}
                                            </span>"
                                        </p>
                                        <p className="mt-4 text-neutral-400 max-w-md mx-auto">
                                            Probá cambiando la búsqueda o seleccionando otro filtro.
                                        </p>
                                        <button
                                            onClick={onResetFilters}
                                            className="mt-8 px-8 py-3 rounded-full bg-black text-white font-semibold hover:scale-105 transition"
                                        >
                                            Ver todos los productos
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        ) : (
                            filteredProducts.map((product) => (
                                <motion.div
                                    layout
                                    key={product.codigo}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group"
                                >
                                    <ProductCard
                                        product={product}
                                        onAddToCart={handleAddFromCatalog}
                                        onUpdateCartQuantity={updateCartQuantity}
                                        onSelectProduct={onSelectProduct}
                                        cartQty={
                                            cart.find(
                                                item => item.sku === product.variantes?.[0]?.sku
                                            )?.qty || 0
                                        }
                                    />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        );
}