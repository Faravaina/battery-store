"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  type: string;
  brand: string;
  model: string;
  price: number;
  stock: number;
};

type SitePage = {
  id: number;
  slug: string;
  title: string;
  content: string;
};

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pages, setPages] = useState<SitePage[]>([]);
  const [activePage, setActivePage] = useState("catalog");
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const productsResult = await supabase.from("products").select("*");
      const pagesResult = await supabase.from("site_pages").select("*");

      setProducts(productsResult.data || []);
      setPages(pagesResult.data || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  const currentPage = pages.find((p) => p.slug === activePage);

  const searchResults = useMemo(() => {
    if (!search) return [];

    return products.filter((p) =>
      `${p.brand} ${p.model} ${p.type}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search, products]);

  const types = useMemo(
    () => Array.from(new Set(products.map((p) => p.type))),
    [products]
  );

  const brands = useMemo(() => {
    return Array.from(
      new Set(
        products
          .filter((p) => (type ? p.type === type : true))
          .map((p) => p.brand)
      )
    );
  }, [type, products]);

  const models = useMemo(() => {
    return Array.from(
      new Set(
        products
          .filter((p) => (type ? p.type === type : true))
          .filter((p) => (brand ? p.brand === brand : true))
          .map((p) => p.model)
      )
    );
  }, [type, brand, products]);

  const result = useMemo(() => {
    if (!type && !brand && !model) return null;

    return products.find(
      (p) =>
        (!type || p.type === type) &&
        (!brand || p.brand === brand) &&
        (!model || p.model === model)
    );
  }, [type, brand, model, products]);

  return (
    <main
      className="min-h-screen text-white relative"
      style={{
        backgroundImage: "url('/warehouse.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/75" />

      <div className="relative z-10">
        <header className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <h1
            onClick={() => setActivePage("catalog")}
            className="text-xl font-bold cursor-pointer"
          >
            BatteryStore
          </h1>

          <nav className="flex flex-wrap justify-center gap-4 text-sm text-zinc-300">
            <button onClick={() => setActivePage("catalog")}>Каталог</button>
            <button onClick={() => setActivePage("about")}>Про нас</button>
            <button onClick={() => setActivePage("delivery")}>Доставка</button>
            <button onClick={() => setActivePage("warranty")}>Гарантія</button>
            <button onClick={() => setActivePage("contacts")}>Контакти</button>
          </nav>
        </header>

        {activePage === "catalog" ? (
          <>
            <section className="max-w-6xl mx-auto px-6 py-16 text-center">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Каталог акумуляторів
                <span className="block text-zinc-300">
                  для ноутбуків та гаджетів
                </span>
              </h2>

              <p className="text-zinc-300 max-w-2xl mx-auto">
                Пошук за типом, брендом та моделлю. Дані завантажуються з бази
                даних.
              </p>
            </section>

            <section className="max-w-2xl mx-auto px-6 mb-6">
              <input
                type="text"
                placeholder="Пошук моделі або бренду..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-4 rounded-2xl bg-black/60 border border-zinc-700 text-white"
              />

              {search && (
                <div className="mt-3 bg-black/80 border border-zinc-700 rounded-2xl overflow-hidden">
                  {searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border-b border-zinc-800 hover:bg-zinc-800 cursor-pointer"
                        onClick={() => {
                          setType(item.type);
                          setBrand(item.brand);
                          setModel(item.model);
                          setSearch("");
                        }}
                      >
                        <p className="font-semibold">
                          {item.brand} {item.model}
                        </p>
                        <p className="text-sm text-zinc-400">{item.type}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-zinc-400">Нічого не знайдено</div>
                  )}
                </div>
              )}
            </section>

            <section className="max-w-2xl mx-auto px-6 space-y-3">
              <select
                className="w-full p-3 rounded-xl bg-black/60 border border-zinc-700"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setBrand("");
                  setModel("");
                }}
              >
                <option value="">Тип</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                className="w-full p-3 rounded-xl bg-black/60 border border-zinc-700"
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  setModel("");
                }}
              >
                <option value="">Бренд</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <select
                className="w-full p-3 rounded-xl bg-black/60 border border-zinc-700"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="">Модель</option>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </section>

            <section className="max-w-2xl mx-auto px-6 mt-10 pb-20">
              {loading ? (
                <div className="p-6 rounded-2xl border border-zinc-800 bg-black/60">
                  <p className="text-zinc-300">Завантаження товарів...</p>
                </div>
              ) : result ? (
                <div className="p-6 rounded-2xl border border-zinc-800 bg-black/60">
                  <h3 className="text-2xl font-semibold mb-2">
                    {result.brand} {result.model}
                  </h3>

                  <p className="text-zinc-300">Тип: {result.type}</p>

                  <p className="text-white mt-2 text-lg">
                    Ціна: ${result.price}
                  </p>

                  <p className="text-zinc-300">
                    В наявності: {result.stock} шт
                  </p>
                </div>
              ) : null}
            </section>
          </>
        ) : (
          <section className="max-w-6xl mx-auto px-6 py-24">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-400 mb-4">
                BatteryStore
              </p>

              <h2 className="text-4xl md:text-6xl font-bold mb-8">
                {currentPage?.title}
              </h2>

              <div className="text-lg text-zinc-300 whitespace-pre-line leading-9">
                {currentPage?.content}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}