import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Heart,
  Zap,
  Trophy,
  Target
} from "lucide-react";

const stats = [
  {
    name: "Usuarios Totales",
    value: "2,847",
    change: "+12%",
    changeType: "positive",
    icon: Users
  },
  {
    name: "Unidades",
    value: "24",
    change: "+2",
    changeType: "positive",
    icon: BookOpen
  },
  {
    name: "Lecciones",
    value: "156",
    change: "+8",
    changeType: "positive",
    icon: GraduationCap
  },
  {
    name: "Tasa de Completación",
    value: "73%",
    change: "+5%",
    changeType: "positive",
    icon: Target
  }
];

const gamificationStats = [
  {
    name: "Corazones Activos",
    value: "14,235",
    icon: Heart,
    color: "text-red-500"
  },
  {
    name: "ZAP Tokens",
    value: "89,432",
    icon: Zap,
    color: "text-primary" // adaptado a tu primario (#32C781)
  },
  {
    name: "Rachas Activas",
    value: "1,847",
    icon: Trophy,
    color: "text-accent" // armonizado con tu paleta de acento
  },
  {
    name: "NFTs Minteados",
    value: "432",
    icon: TrendingUp,
    color: "text-secondary" // armonizado con tu paleta secundaria
  }
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 bg-background text-foreground min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Panel de administración del sistema educativo
        </p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              className="bg-card text-card-foreground border border-border"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs ${
                    stat.changeType === "positive"
                      ? "text-green-500"
                      : "text-destructive"
                  }`}
                >
                  {stat.change} desde el mes pasado
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats de gamificación */}
      <div>
        <h2 className="text-xl font-bold mb-4">Sistema de Gamificación</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {gamificationStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.name}
                className="bg-card text-card-foreground border border-border"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.name}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Actividad reciente y usuarios más activos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="bg-card text-card-foreground border border-border">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Nueva unidad creada: "Blockchain Basics"
                  </p>
                  <p className="text-sm text-muted-foreground">hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Usuario completó lección de Smart Contracts
                  </p>
                  <p className="text-sm text-muted-foreground">hace 3 horas</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    NFT minteado por completar unidad
                  </p>
                  <p className="text-sm text-muted-foreground">hace 5 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border border-border">
          <CardHeader>
            <CardTitle>Usuarios Más Activos</CardTitle>
            <CardDescription>
              Top usuarios por XP ganado esta semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: "alice@example.com",
                  xp: "1,250",
                  rank: "#1",
                  color: "text-green-500"
                },
                {
                  name: "bob@example.com",
                  xp: "980",
                  rank: "#2",
                  color: "text-primary"
                },
                {
                  name: "charlie@example.com",
                  xp: "875",
                  rank: "#3",
                  color: "text-accent"
                }
              ].map((user) => (
                <div
                  key={user.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.xp} XP
                      </p>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${user.color}`}>
                    {user.rank}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
