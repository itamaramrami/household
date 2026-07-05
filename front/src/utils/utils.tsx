export const getUserIdFromToken = (): { userId: string; name: string } | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) throw new Error("Invalid token format");

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const payload = JSON.parse(jsonPayload);

        // בדיקה לראות את ה-payload המפוענח (לא חובה בייצור)
        console.log("Decoded payload:", payload);

        return {
            userId: payload.user_id || null,
            name: payload.name || '' // תומך בעברית
        };
    } catch (error) {
        console.error("Failed to decode token:", error);
        return null;
    }
};
