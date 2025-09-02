import { HeaderBar } from "@/components/header-bar";

async function HomePage() {

  return (
    <div className="HomePage">
      <HeaderBar hearts={5} percentage={100} hasActiveSubscription={false}/>
        <div>pending..</div>
    </div>
  );
}

export default HomePage;
