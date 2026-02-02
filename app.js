const { createApp } = Vue;

function normalize(value) {
  return value.trim().toLowerCase();
}

createApp({
  data() {
    return {
      query: "",
      result: null,
      notFound: false,
      baseList: [],
      newTech: "",
      newLanguage: "",
      passwordInput: "",
      addError: "",
      techFilter: "",
      languageFilter: "",
      strictFilter: true,
    };
  },
  computed: {
    mergedList() {
      return [...this.baseList].sort((a, b) =>
        a.tech.localeCompare(b.tech)
      );
    },
    filteredList() {
      const techFilter = normalize(this.techFilter);
      const languageFilter = normalize(this.languageFilter);
      return this.mergedList.filter((item) => {
        const techValue = normalize(item.tech);
        const languageValue = normalize(item.language);
        const matchesTech = techFilter
          ? this.strictFilter
            ? techValue === techFilter
            : techValue.includes(techFilter)
          : true;
        const matchesLanguage = languageFilter
          ? this.strictFilter
            ? languageValue === languageFilter
            : languageValue.includes(languageFilter)
          : true;
        return matchesTech && matchesLanguage;
      });
    },
  },
  methods: {
    async loadBase() {
      const response = await fetch("/api/techs");
      const data = await response.json();
      this.baseList = data;
    },
    searchTech() {
      const key = normalize(this.query);
      if (!key) return;
      const found = this.mergedList.find(
        (item) => normalize(item.tech) === key
      );
      this.result = found || null;
      this.notFound = !found;
    },
    async addTech() {
      this.addError = "";
      const tech = this.newTech.trim();
      const language = this.newLanguage.trim();
      const password = this.passwordInput;
      if (!tech || !language) {
        this.addError = "Merci de remplir les deux champs.";
        return;
      }
      try {
        await this.addViaApi(tech, language, password);
        this.newTech = "";
        this.newLanguage = "";
        this.passwordInput = "";
        this.query = tech;
        await this.loadBase();
        this.searchTech();
      } catch (err) {
        this.addError = err.message || "Erreur lors de l'ajout.";
      }
    },
    async addViaApi(tech, language, password) {
      if (!password) {
        throw new Error("Mot de passe obligatoire.");
      }
      const credentials = btoa(`tech:${password}`);
      const response = await fetch("/api/techs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({ tech, language }),
      });
      if (response.ok) return;
      if (response.status === 401) {
        throw new Error("Mot de passe incorrect.");
      }
      if (response.status === 409) {
        throw new Error("Cette techno existe deja dans la base.");
      }
      throw new Error("Erreur serveur.");
    },
    resetFilters() {
      this.techFilter = "";
      this.languageFilter = "";
      this.strictFilter = true;
    },
  },
  async mounted() {
    await this.loadBase();
  },
}).mount("#app");
