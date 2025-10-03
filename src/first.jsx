import React, { useEffect, useState, useMemo } from "react";

function Main() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!res.ok) throw new Error("Network response not ok");
        const data = await res.json();
        if (!cancelled) setUsers(data);
      } catch (e) {
        if (!cancelled) {
          setError("Failed to fetch users. Please try again.");
          setUsers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, []); // ✅ no missing deps

  // Unique city list
  const cities = useMemo(() => {
    const s = new Set(users.map((u) => u.address?.city).filter(Boolean));
    return ["All", ...Array.from(s).sort()];
  }, [users]);

  // Filtering, searching, sorting
  const filtered = useMemo(() => {
    let list = [...users];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((u) =>
        (u.name + u.email + u.username + (u.company?.name || ""))
          .toLowerCase()
          .includes(q)
      );
    }
    if (cityFilter !== "All") {
      list = list.filter((u) => u.address?.city === cityFilter);
    }

    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "company") {
        return (a.company?.name || "").localeCompare(b.company?.name || "");
      }
      return 0;
    });
    return list;
  }, [users, query, cityFilter, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Staff directory</h1>

        <div className="flex gap-2 items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, username or company..."
            className="px-3 py-2 border rounded-md shadow-sm w-64"
          />

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="name">Sort: Name</option>
            <option value="company">Sort: Company</option>
          </select>
        </div>
      </header>

      <main>
        {loading ? (
          <div className="text-center py-12">Loading users...</div>
        ) : (
          <>
            {users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No users found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {paginated.map((u) => (
                  <article
                    key={u.id}
                    className="p-3 border rounded-xl shadow-sm hover:shadow-md transition bg-white flex flex-col"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                        {u.name
                          .split(" ")
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <h2 className="text-base font-semibold">{u.name}</h2>
                        <p className="text-xs text-gray-500">@{u.username}</p>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                      <p>{u.company?.name}</p>
                      <p>{u.email}</p>
                      <p>
                        {u.address?.city}, {u.address?.zipcode}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <footer className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filtered.length} result(s)
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </button>
                <div className="px-3 py-1 border rounded">
                  Page {page} / {totalPages}
                </div>
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </footer>
          </>
        )}

        {error && <div className="mt-4 text-red-600">{error}</div>}
      </main>
    </div>
  );
}

export default Main;
