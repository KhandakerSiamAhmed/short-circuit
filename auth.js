
// Authentication Logic
const Auth = {
    async checkSession() {
        if (!_supabase) {
            console.error("Supabase client not initialized. Make sure db.js is loaded first.");
            return;
        }
        const { data: { session } } = await _supabase.auth.getSession();

        // If no session and we are NOT on the login page, redirect
        if (!session && !window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
        }

        // If session and we ARE on the login page, redirect to index
        if (session && window.location.href.includes('login.html')) {
            window.location.href = 'invoice.html';
        }

        return session;
    },

    async login(email, password) {
        const { data, error } = await _supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) throw error;
        return data;
    },

    async logout() {
        const { error } = await _supabase.auth.signOut();
        if (error) throw error;
        window.location.href = 'login.html';
    }
};

// Auto-check session on load
document.addEventListener('DOMContentLoaded', () => {
    Auth.checkSession();
});
