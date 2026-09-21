export const formatPrice = (price) => {
            const numberPrice = Number(price) || 0;
            return new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(numberPrice);
        };

export const slugify = (valor) =>
                String(valor || "")
                    .trim()
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "");

export const matchSlug = (lista, slug) =>
            (lista || []).find(item => slugify(item) === slug) || null;

export const buildHash = ({ rubro, categoria, subcategoria, codigo }) => {
            const parts = [];
            if (rubro && rubro !== "All") parts.push(slugify(rubro));
            if (categoria && categoria !== "All") parts.push(slugify(categoria));
            if (subcategoria && subcategoria !== "All") parts.push(slugify(subcategoria));
            if (codigo) parts.push("p", encodeURIComponent(codigo));
            return "#/" + (parts.join("/") || "");
        };

export const parseHash = (products) => {
            const raw = window.location.hash.replace(/^#\/?/, "");
            const parts = raw.split("/").filter(Boolean);
            const rubros = [...new Set(products.flatMap(p => p.rubros || []))];
            const cats = [...new Set(products.flatMap(p => p.categorias || []))];
            const subs = [...new Set(products.flatMap(p => p.subcategorias || []))];
            let i = 0;
            let rubro = "All";
            let categoria = "All";
            let subcategoria = "All";
            let codigo = null;
            if (parts[i] && parts[i] !== "p") {
                const r = matchSlug(rubros, parts[i]);
                if (r) { rubro = r; i++; }
            }
            if (parts[i] && parts[i] !== "p") {
                const c = matchSlug(cats, parts[i]);
                if (c) { categoria = c; i++; }
            }
            if (parts[i] && parts[i] !== "p") {
                const s = matchSlug(subs, parts[i]);
                if (s) { subcategoria = s; i++; }
            }
            if (parts[i] === "p" && parts[i + 1]) {
                codigo = decodeURIComponent(parts[i + 1]);
            }
            return { rubro, categoria, subcategoria, codigo };
        };
        
export const impuesto = 1.21;