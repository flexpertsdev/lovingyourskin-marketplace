
import { FunctionComponent, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPreorderProduct } from "../services/mock/preorder.service";
import { Product } from "../types";
import { Container } from "../components/layout/Container";
import { Grid } from "../components/layout/Grid";
import { Section } from "../components/layout/Section";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export const PreorderDetail: FunctionComponent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      const preorderProduct = getPreorderProduct(id);
      if (preorderProduct) {
        setProduct(preorderProduct);
      } else {
        navigate("/preorder");
      }
    }
  }, [id, navigate]);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <PageHeader
        title={product.name.en}
        subtitle={`Preorder ${product.name.en}`}
      />
      <Container>
        <Section>
          <Grid cols={2}>
            <div>
              <img src={product.images[0]} alt={product.name.en} className="w-full h-auto rounded-lg shadow-lg" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">{product.name.en}</h2>
              <p className="text-lg mb-4">{product.description.en}</p>
              <p className="text-2xl font-bold text-blue-600 mb-4">Retail Price: ${(product.price.retail ?? product.retailPrice?.item ?? 0).toFixed(2)}</p>
              <div className="flex items-center mb-4">
                <label htmlFor="quantity" className="mr-4">Quantity:</label>
                <Input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} className="w-20" />
              </div>
              <Button size="large" onClick={() => navigate("/checkout")} className="w-full">Preorder Now</Button>
            </div>
          </Grid>
        </Section>
      </Container>
    </div>
  );
};
