import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("should render with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should handle click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText("Click me")).toBeDisabled();
  });

  it("should be disabled when isLoading is true", () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByText("Click me")).toBeDisabled();
  });

  it("should show loading spinner when isLoading is true", () => {
    render(<Button isLoading>Click me</Button>);
    const spinner = screen.getByRole("button").querySelector("svg");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("animate-spin");
  });

  it("should apply variant classes correctly", () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText("Primary")).toHaveClass("bg-black");

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText("Secondary")).toHaveClass("bg-gray-200");

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByText("Danger")).toHaveClass("bg-red-600");
  });

  it("should apply size classes correctly", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByText("Small")).toHaveClass("h-8");

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByText("Medium")).toHaveClass("h-10");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText("Large")).toHaveClass("h-12");
  });

  it("should merge custom className", () => {
    render(<Button className="custom-class">Button</Button>);
    expect(screen.getByText("Button")).toHaveClass("custom-class");
  });
});
