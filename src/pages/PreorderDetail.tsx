
import { FunctionComponent, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../services";
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
      productService.getById(id)
        .then(product => {
          if (product && product.isPreorder) {
            setProduct(product);
          } else {
            navigate("/preorder");
          }
        })
        .catch(() => {
          navigate("/preorder");
        });
    }
  }, [id, navigate]);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <PageHeader
        title={product.name}
      subtitle={`Preorder ${product.name}`}
      />
      <Container>
        <Section>
          <Grid cols={2}>
            <div>
              <img src={product.images?.primary || ''} alt={product.name} className="w-full h-auto rounded-lg shadow-lg" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
        <p className="text-lg mb-4">{product.description}</p>
              <p className="text-2xl font-bold text-blue-600 mb-4">Retail Price: ${(product.price?.retail ?? product.retailPrice?.item ?? 0).toFixed(2)}</p>
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
