export async function authFetch(url: string, options: RequestInit = {}) {
  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const headers: any = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Only attach token if it exists
  if (authToken) {
    headers.authToken = authToken;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data: any = null;

  try {
    data = await response.clone().json();
  } catch {}

  // Only redirect if token exists but is invalid
  if (
    authToken &&
    data &&
    data.operationSuccessful === false &&
    data.errorMessage === "Invalid client credentials"
  ) {
    localStorage.removeItem("authToken");

    document.cookie =
      "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    const currentPath = window.location.pathname + window.location.search;

    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;

    throw new Error("Session expired.");
  }

  return response;
}
