import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "./Input";

describe("Input", () => {
  it("should render with label", () => {
    render(<Input label="Email" id="email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("should handle input changes", () => {
    const handleChange = jest.fn();
    render(<Input id="test" onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test value" } });

    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue("test value");
  });

  it("should display error message", () => {
    render(<Input id="test" error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("should display helper text", () => {
    render(<Input id="test" helperText="Enter your email address" />);
    expect(screen.getByText("Enter your email address")).toBeInTheDocument();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Input id="test" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("should apply error styles when error is present", () => {
    render(<Input id="test" error="Error message" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("border-red-500");
  });

  it("should support different input types", () => {
    const { rerender } = render(<Input id="test" type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

    rerender(<Input id="test" type="password" />);
    expect(screen.getByLabelText("")).toHaveAttribute("type", "password");
  });
});
