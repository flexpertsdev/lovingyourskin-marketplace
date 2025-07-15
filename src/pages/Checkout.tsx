
import { FunctionComponent } from "react";
import { Container } from "../components/layout/Container";
import { Grid } from "../components/layout/Grid";
import { Section } from "../components/layout/Section";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";

export const Checkout: FunctionComponent = () => {
  return (
    <div>
      <PageHeader title="Checkout" />
      <Container>
        <Section>
          <Grid cols={2}>
            <div>
              <h2 className="text-2xl font-bold mb-4">Shipping Information</h2>
              <form>
                <Input label="Full Name" placeholder="John Doe" />
                <Input label="Address" placeholder="123 Main St" />
                <Input label="City" placeholder="Anytown" />
                <Grid cols={2}>
                  <Input label="State" placeholder="CA" />
                  <Input label="ZIP Code" placeholder="12345" />
                </Grid>
                <Select label="Country" options={[{ value: "US", label: "United States" }]} />
              </form>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Payment Details</h2>
              <form>
                <Input label="Card Number" placeholder="**** **** **** ****" />
                <Grid cols={2}>
                  <Input label="Expiration Date" placeholder="MM/YY" />
                  <Input label="CVC" placeholder="123" />
                </Grid>
              </form>
              <div className="mt-8">
                <h3 className="text-xl font-bold">Order Summary</h3>
                <div className="flex justify-between mt-4">
                  <span>Subtotal</span>
                  <span>$160.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>$10.00</span>
                </div>
                <div className="flex justify-between font-bold mt-4">
                  <span>Total</span>
                  <span>$170.00</span>
                </div>
                <Button size="large" className="mt-8 w-full">Confirm Preorder</Button>
              </div>
            </div>
          </Grid>
        </Section>
      </Container>
    </div>
  );
};
