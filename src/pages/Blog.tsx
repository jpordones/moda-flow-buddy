import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, User, TrendingUp, Mail } from "lucide-react";

const categories = [
  "Todos",
  "Precificação",
  "Estoque",
  "Estratégia",
  "Multi-canal",
  "Lucro",
  "Cases"
];

const articles = [
  {
    id: 1,
    title: "Como Calcular o Preço de Venda Ideal para Moda",
    excerpt: "Aprenda a metodologia LAMAR para definir preços que garantem margem de lucro saudável sem perder competitividade.",
    category: "Precificação",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    readTime: "8 min",
    author: "João Silva",
    date: "15 Jan 2025"
  },
  {
    id: 2,
    title: "5 Erros que Destroem sua Margem de Lucro",
    excerpt: "Descubra os erros mais comuns que lojistas cometem e como evitá-los para proteger seus lucros.",
    category: "Lucro",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop",
    readTime: "6 min",
    author: "Maria Santos",
    date: "12 Jan 2025"
  },
  {
    id: 3,
    title: "Gestão de Estoque Multi-Canal: Guia Completo",
    excerpt: "Como sincronizar estoque entre Shopee, Mercado Livre, sua loja virtual e loja física sem erros.",
    category: "Multi-canal",
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&h=400&fit=crop",
    readTime: "12 min",
    author: "Carlos Mendes",
    date: "10 Jan 2025"
  },
  {
    id: 4,
    title: "Case: Como a Loja XYZ Aumentou Margem em 25%",
    excerpt: "Estudo de caso real de uma loja de moda feminina que transformou sua gestão com o FEDCOM.",
    category: "Cases",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop",
    readTime: "10 min",
    author: "Ana Costa",
    date: "08 Jan 2025"
  },
  {
    id: 5,
    title: "Previsão de Demanda com IA: O Futuro do Varejo",
    excerpt: "Entenda como a inteligência artificial pode prever vendas e otimizar seu estoque automaticamente.",
    category: "Estratégia",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop",
    readTime: "7 min",
    author: "João Silva",
    date: "05 Jan 2025"
  },
  {
    id: 6,
    title: "Quando Fazer Promoção Sem Perder Dinheiro",
    excerpt: "Estratégias para criar promoções que realmente funcionam e não destroem sua margem.",
    category: "Estratégia",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=400&fit=crop",
    readTime: "9 min",
    author: "Maria Santos",
    date: "02 Jan 2025"
  }
];

const popularArticles = articles.slice(0, 3);

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === "Todos" || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Blog <span className="text-primary">FEDCOM</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            Estratégias, Dicas e Insights para E-commerce de Moda
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar artigos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs sm:text-sm"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 sm:p-5">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {article.category}
                    </Badge>
                    <h3 className="font-bold text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {article.author}
                        </span>
                      </div>
                      <span>{article.date}</span>
                    </div>
                    <Button variant="link" className="p-0 h-auto mt-3 text-primary">
                      Ler artigo →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum artigo encontrado.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 space-y-6">
            {/* Popular Articles */}
            <Card>
              <CardContent className="p-4 sm:p-5">
                <h3 className="font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Mais Lidos
                </h3>
                <div className="space-y-4">
                  {popularArticles.map((article, index) => (
                    <div key={article.id} className="flex gap-3">
                      <span className="text-2xl font-bold text-primary/30">{index + 1}</span>
                      <div>
                        <h4 className="font-medium text-sm line-clamp-2 hover:text-primary cursor-pointer transition-colors">
                          {article.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">{article.readTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
              <CardContent className="p-4 sm:p-5">
                <Mail className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-bold text-base sm:text-lg mb-2">
                  📬 Newsletter
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Receba os melhores conteúdos sobre e-commerce de moda direto no seu email.
                </p>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Seu melhor email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button className="w-full">Inscrever-se</Button>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardContent className="p-4 sm:p-5">
                <h3 className="font-bold text-base sm:text-lg mb-4">Categorias</h3>
                <div className="space-y-2">
                  {categories.filter(c => c !== "Todos").map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className="block w-full text-left text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
