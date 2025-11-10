import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Users, 
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-20 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Platform Manajemen Agensi Terdepan</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
              Manajemen Agensi Kreator: Payroll Cerdas, Proses Mulus
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Otomatisasi payroll, lacak performa, dan kelola kreator Anda dengan platform all-in-one yang powerful dan intuitif
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate('/login')}
              >
                Mulai Sekarang
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => navigate('/login')}
              >
                Daftar Gratis
              </Button>
            </div>
          </motion.div>

          {/* Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 relative max-w-6xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 transform perspective-1000 rotate-x-2">
              <div className="bg-card p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Total Kreator</span>
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-3xl font-bold">24</div>
                    <div className="text-sm text-success flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>+12% bulan ini</span>
                    </div>
                  </div>
                  <div className="bg-success/5 border border-success/20 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Total Penjualan</span>
                      <DollarSign className="w-5 h-5 text-success" />
                    </div>
                    <div className="text-3xl font-bold">Rp 45.2M</div>
                    <div className="text-sm text-success flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>+28% bulan ini</span>
                    </div>
                  </div>
                  <div className="bg-accent/5 border border-accent/20 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Sesi Live</span>
                      <BarChart3 className="w-5 h-5 text-accent" />
                    </div>
                    <div className="text-3xl font-bold">156</div>
                    <div className="text-sm text-success flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>+18% bulan ini</span>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 h-48 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-16 h-16 text-muted-foreground/30" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Semua yang Anda Butuhkan dalam Satu Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Kelola agensi kreator Anda dengan mudah dan efisien
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <motion.div variants={fadeInUp} className="group">
              <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 h-full hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Zap className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Payroll Otomatis, Pembayaran Mudah</h3>
                  <p className="text-muted-foreground mb-6">
                    Hitung komisi dan gaji kreator secara otomatis berdasarkan performa. Sistem kami menangani perhitungan kompleks dengan akurat dan real-time.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Perhitungan komisi otomatis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Multiple skema komisi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Laporan gaji lengkap</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeInUp} className="group">
              <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 h-full hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="w-14 h-14 bg-success/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-7 h-7 text-success" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Lacak Performa, Dorong Pertumbuhan</h3>
                  <p className="text-muted-foreground mb-6">
                    Dashboard analytics yang powerful untuk monitoring sesi live, penjualan, dan performa kreator secara real-time dengan visualisasi yang mudah dipahami.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Tracking sesi live real-time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Analitik penjualan mendalam</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Laporan performa kreator</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeInUp} className="group">
              <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 h-full hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Fokus pada Kreator, Optimal untuk Agensi</h3>
                  <p className="text-muted-foreground mb-6">
                    Kelola semua aspek kreator dari onboarding hingga pembayaran. Inventaris produk, konten, dan keuangan dalam satu platform terintegrasi.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Manajemen kreator lengkap</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Inventaris & keuangan terintegrasi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Role-based access control</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <motion.div 
          {...fadeInUp}
          className="container mx-auto px-4 relative"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Siap Mengoptimalkan Agensi Anda?
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Bergabunglah dengan agensi-agensi modern yang telah meningkatkan efisiensi mereka hingga 300%
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate('/login')}
              >
                Mulai Gratis Sekarang
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Creator Verse Payroll</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Beranda</a>
              <a href="#" className="hover:text-foreground transition-colors">Fitur</a>
              <a href="#" className="hover:text-foreground transition-colors">Kontak</a>
              <a href="#" className="hover:text-foreground transition-colors">Kebijakan Privasi</a>
            </nav>
            <p className="text-sm text-muted-foreground">
              © 2025 Creator Verse. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}