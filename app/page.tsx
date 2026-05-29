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

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [sendingOrder, setSendingOrder] = useState(false);

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

  const sendOrder = async () => {
    if (!result) return;

    if (!customerName || !customerPhone) {
      setOrderMessage("Заповніть ім'я та телефон");
      return;
    }

    setSendingOrder(true);
    setOrderMessage("");

    const { error } = await supabase.from("orders").insert({
      product_id: result.id,
      product_brand: result.brand,
      product_model: result.model,
      product_type: result.type,
      product_price: result.price,
      customer_name: customerName,
      customer_phone: customerPhone,
    });

    setSendingOrder(false);

    if (error) {
      console.error(error);
      setOrderMessage("Помилка. Спробуйте ще раз.");
      return;
    }

    setOrderMessage("Заявку відправлено. Ми скоро зв'яжемось з вами.");
    setCustomerName("");
    setCustomerPhone("");
    setShowOrderForm(false);
  };

  const menu = [
    { slug: "catalog", label: "Каталог" },
    { slug: "about", label: "Про нас" },
    { slug: "delivery", label: "Доставка" },
    { slug: "warranty", label: "Гарантія" },
    { slug: "contacts", label: "Контакти" },
  ];

  return (
    <main
      className="min-h-screen text-white relative flex flex-col"
      style={{
        backgroundImage: "url('/warehouse.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/75" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-5">
          <div className="rounded-2xl border border-white/10 bg-black/45 backdrop-blur-md px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1
              onClick={() => setActivePage("catalog")}
              className="text-xl font-bold cursor-pointer text-center md:text-left"
            >
              BatteryStore
            </h1>

            <nav className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-2 text-sm">
              {menu.map((item) => (
                <button
                  key={item.slug}
                  onClick={() => setActivePage(item.slug)}
                  className={`rounded-xl px-4 py-2 border transition ${
                    activePage === item.slug
                      ? "bg-white text-black border-white"
                      : "bg-black/40 text-zinc-300 border-zinc-700 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <div className="flex-1">
          {activePage === "catalog" ? (
            <>
              <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-10 md:pt-16 text-center">
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-5 leading-tight">
                  Каталог акумуляторів
                  <span className="block text-zinc-300">
                    для ноутбуків та гаджетів
                  </span>
                </h2>

                <p className="text-zinc-300 max-w-2xl mx-auto text-base sm:text-lg">
                  Пошук за типом, брендом та моделлю. Дані завантажуються з бази
                  даних.
                </p>
              </section>

              <section className="max-w-2xl mx-auto px-4 sm:px-6 mb-5">
                <input
                  type="text"
                  placeholder="Пошук моделі або бренду..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-black/65 border border-zinc-700 text-white outline-none focus:border-white"
                />

                {search && (
                  <div className="mt-3 bg-black/85 border border-zinc-700 rounded-2xl overflow-hidden">
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
                            setShowOrderForm(false);
                            setOrderMessage("");
                          }}
                        >
                          <p className="font-semibold">
                            {item.brand} {item.model}
                          </p>
                          <p className="text-sm text-zinc-400">{item.type}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-zinc-400">
                        Нічого не знайдено
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section className="max-w-2xl mx-auto px-4 sm:px-6 space-y-3">
                <select
                  className="w-full p-4 rounded-xl bg-black/65 border border-zinc-700 text-white"
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setBrand("");
                    setModel("");
                    setShowOrderForm(false);
                    setOrderMessage("");
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
                  className="w-full p-4 rounded-xl bg-black/65 border border-zinc-700 text-white"
                  value={brand}
                  onChange={(e) => {
                    setBrand(e.target.value);
                    setModel("");
                    setShowOrderForm(false);
                    setOrderMessage("");
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
                  className="w-full p-4 rounded-xl bg-black/65 border border-zinc-700 text-white"
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    setShowOrderForm(false);
                    setOrderMessage("");
                  }}
                >
                  <option value="">Модель</option>
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </section>

              <section className="max-w-2xl mx-auto px-4 sm:px-6 mt-8 pb-16">
                {loading ? (
                  <div className="p-6 rounded-2xl border border-zinc-800 bg-black/65">
                    <p className="text-zinc-300">Завантаження товарів...</p>
                  </div>
                ) : result ? (
                  <div className="p-6 rounded-2xl border border-zinc-700 bg-black/70 backdrop-blur-sm">
                    <h3 className="text-2xl font-semibold mb-2">
                      {result.brand} {result.model}
                    </h3>

                    <p className="text-zinc-300">Тип: {result.type}</p>

                    <p className="text-white mt-2 text-lg">
                      Ціна: {result.price} грн
                    </p>

                    <p className={`mt-2 font-semibold ${
    result.stock > 0 ? "text-green-400" : "text-red-400"
  }`}
>
  {result.stock > 0
    ? `🟢 В наявності: ${result.stock} шт`
    : "🔴 Немає в наявності"}
                    </p>

                    <button
                      onClick={() => setShowOrderForm(!showOrderForm)}
                      className="mt-5 w-full rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
                    >
                      Замовити
                    </button>

                    {showOrderForm && (
                      <div className="mt-5 space-y-3">
                        <input
                          type="text"
                          placeholder="Ваше ім'я"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full p-4 rounded-xl bg-black/60 border border-zinc-700 text-white outline-none focus:border-white"
                        />

                        <input
                          type="tel"
                          placeholder="Ваш телефон"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full p-4 rounded-xl bg-black/60 border border-zinc-700 text-white outline-none focus:border-white"
                        />

                        <button
                          onClick={sendOrder}
                          disabled={sendingOrder}
                          className="w-full rounded-xl bg-green-500 px-5 py-3 font-semibold text-black hover:bg-green-400 disabled:opacity-60"
                        >
                          {sendingOrder ? "Відправляємо..." : "Відправити заявку"}
                        </button>
                      </div>
                    )}

                    {orderMessage && (
                      <p className="mt-4 text-sm text-zinc-300">
                        {orderMessage}
                      </p>
                    )}
                  </div>
                ) : null}
              </section>
            </>
          ) : (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
              <div className="max-w-2xl">
                <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-zinc-400 mb-4">
                  BatteryStore
                </p>

                <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                  {currentPage?.title}
                </h2>

                <div className="text-base sm:text-lg text-zinc-300 whitespace-pre-line leading-8 sm:leading-9">
                  {currentPage?.content}
                </div>
              </div>
            </section>
          )}
        </div>

        <footer className="relative border-t border-white/10 bg-black/55 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-center md:text-left">
            <p className="text-sm text-zinc-400">
              © 2026 BatteryStore. Усі права захищені.
            </p>

            <div className="flex flex-wrap justify-center gap-3 text-sm text-zinc-400">
              <button onClick={() => setActivePage("delivery")}>
                Доставка
              </button>
              <button onClick={() => setActivePage("warranty")}>
                Гарантія
              </button>
              <button onClick={() => setActivePage("contacts")}>
                Контакти
              </button>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}