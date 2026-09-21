import { useEffect } from "react";

export default function SearchBar({
    searchTerm,
    setSearchTerm,
    searchScope,
    setSearchScope,
    onSearch
}) {
    useEffect(() => {
        if (window.lucide) {createIcons();}
    }, [onSearch]);
    return(
        <div className="max-w-7xl mx-auto px-8 mb-8">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-neutral-100 transition-all focus-within:shadow-md">
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
                    {[
                        { value: "all", label: "Todo" },
                        { value: "descripcion", label: "Descripción" },
                        { value: "codigo", label: "Código" },
                        { value: "marca", label: "Marca" },
                        { value: "sku", label: "SKU" }
                    ].map((scope) => (
                        <button
                            key={scope.value}
                            onClick={() => setSearchScope(scope.value)}
                            className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
                                searchScope === scope.value
                                    ? "bg-black text-white shadow-lg"
                                    : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200"
                            }`}
                        >
                            {scope.label}
                        </button>
                    ))}
                </div>
                <div className="relative flex items-center">
                    <i 
                        data-lucide="search" 
                        className="absolute left-4 w-5 h-5 text-neutral-300">
                    </i>
                    <input 
                        type="text"
                        placeholder={
                            `Buscar por ${
                                searchScope === "all"
                                    ? "coincidencias en general"
                                    : searchScope === "descripcion"
                                        ? "descripción"
                                        : searchScope === "codigo"
                                            ? "código"
                                            : searchScope
                            }...`
                        }
                        className=" w-full pl-12 pr-12 py-3 bg-neutral-50 rounded-2xl 
                                    border-none focus:ring-2 focus:ring-neutral-200 
                                    outline-none text-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {if (e.key === "Enter") {onSearch();}}}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")} 
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                            title="Limpiar búsqueda"
                        >
                            <i 
                                data-lucide="x"     
                                className="w-4 h-4">
                            </i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}