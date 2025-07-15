
import { FunctionComponent, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/features/ProductCard";
import { BrandCard } from "../components/features/BrandCard";
import { Container } from "../components/layout/Container";
import { Grid } from "../components/layout/Grid";
import { Section } from "../components/layout/Section";
import { PageHeader } from "../components/layout/PageHeader";
import { getPreorderProducts } from "../services/mock/preorder.service";
import { Accordion } from "../components/ui/Accordion";
import { productService } from "../services/mock/product.service";
import { Brand } from "../types";

export const Preorder: FunctionComponent = () => {
  const products = getPreorderProducts();
  const [brand, setBrand] = useState<Brand | null>(null);

  useEffect(() => {
    const fetchBrand = async () => {
      if (products.length > 0) {
        const brandData = await productService.getBrand(products[0].brandId);
        setBrand(brandData);
      }
    };
    fetchBrand();
  }, [products]);

  return (
    <div>
      <PageHeader
        title="Exclusive Preorders"
        description="Be the first to get your hands on our upcoming products."
      />
      <img src="/assets/promotional-banner.png" alt="Promotional Banner" className="w-full h-64 object-cover" />
      <Container>
        <Section>
          <Grid cols={3}>
            {products.map((product) => (
              <Link to={`/preorder/${product.id}`} key={product.id}>
                <ProductCard product={product} />
              </Link>
            ))}
          </Grid>
        </Section>
        <Section>
          {brand && <BrandCard brand={brand} />}
        </Section>
        <Section>
          <Accordion
            items={[
              {
                title: "When will my order be shipped?",
                content:
                  "Your order will be shipped as soon as the product is available. We will notify you when your order has been shipped.",
              },
              {
                title: "What are the terms and conditions?",
                content:
                  "You can find our terms and conditions on our website. Please read them carefully before placing your order.",
              },
            ]}
          />
        </Section>
      </Container>
    </div>
  );
};
